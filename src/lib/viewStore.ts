import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * 개별 주소(프로필, 갤러리 앨범)의 조회수를 Upstash Redis에 기록하고 읽는다. 서버 전용.
 *
 * 세는 기준: 개별 주소에 대한 요청 1건 = 조회 1회.
 *   - 주소로 바로 들어온 경우와, 목록에서 카드를 눌러 주소가 바뀐 경우(router.replace) 모두 서버에 요청이 온다.
 *     모달 닫기나 카드형/목록형 전환처럼 같은 항목 안에서 화면 상태만 바뀔 때는 브라우저가 주소창만 바꾸고
 *     요청을 보내지 않으므로 세지 않는다.
 *   - 같은 방문자가 같은 항목을 다시 열어도 24시간에 한 번만 센다. 로컬 개발 서버에서는 이 중복 방지를 끈다.
 *   - 검색엔진·공유 카드 크롤러는 세지 않는다 (User-Agent로 거른다).
 *   - <Link> 미리 가져오기도 세지 않는다. 요청마다 렌더링되는 페이지는 Next.js가 미리 가져올 때 page를 그리지 않아서
 *     여기까지 오지 않는다 (`loading.tsx`를 추가하면 달라질 수 있다).
 *   - 예외: 멤버 목록 주소(/people/members/)에 사람 없이 들어온 요청은 교수 프로필의 조회로 센다. 넓은 화면의 카드형에서는
 *     이때 교수 프로필이 옆 패널에 바로 뜨기 때문이다. 뜨지 않는 목록형과 폰은 뺀다 (people/_lib/peoplePage.tsx).
 *
 * 저장 형태
 *   - `<prefix>:<kind>`                      해시. 필드 = 항목 id, 값 = 조회수
 *   - `<prefix>:seen:<kind>:<id>:<방문자>`   중복 집계를 막는 표시. 24시간 뒤 자동 삭제
 *   - prefix는 로컬 개발 서버(`next dev`)면 `views-dev`, 그 밖에는 `views` (개발 중 숫자가 운영 숫자에 섞이지 않게 분리)
 *
 * 환경변수 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`이 없거나 잘못됐으면 아무것도 하지 않는다.
 * 이 파일의 함수는 어떤 경우에도 예외를 던지지 않고 null을 돌려준다. 조회수 때문에 페이지가 깨지면 안 되기 때문이다.
 */

/**
 * 조회수를 세는 대상.
 * 프로필은 주소가 members/alumni로 나뉘지만 하나로 센다 (id가 같아서, 졸업해 목록이 바뀌어도 조회수가 이어진다).
 */
export type ViewKind = 'profile' | 'gallery';

/** 항목 id → 조회수 */
export type ViewCounts = Record<string, number>;

/**
 * 로컬 개발 서버(`next dev`)인지. 배포 환경이 Vercel이든 자체 서버(`next start`)든, 개발 서버만 아니면 운영으로 본다.
 * 개발 서버에서는 (1) 운영과 다른 키에 쌓고 (2) 중복 방지를 끈다 — 같은 항목을 여러 번 열며 숫자가 오르는지
 * 바로 볼 수 있다. 이때는 요청마다 오르므로 새로고침이나 코드 저장으로 페이지가 다시 그려질 때도 오른다.
 */
const IS_DEV_SERVER = process.env.NODE_ENV === 'development';

const KEY_PREFIX = IS_DEV_SERVER ? 'views-dev' : 'views';
const DEDUP_ENABLED = !IS_DEV_SERVER;
const DEDUP_WINDOW_SECONDS = 60 * 60 * 24;

/** Redis 응답을 이 시간 넘게 기다리지 않는다. 응답 스트림이 Redis 때문에 오래 열려 있지 않게 한다. */
const READ_TIMEOUT_MS = 2000;

/**
 * 사람이 아닌 요청의 User-Agent. 조회수에 넣지 않는다.
 *   - 이름에 bot·crawl·spider가 들어가는 크롤러 대부분 (Googlebot, Bingbot, GPTBot, Baiduspider 등)
 *   - 이름으로는 드러나지 않는 크롤러: 네이버(Yeti), 다음(Daum/, Daumoa), 야후(Slurp), 구글의 보조 수집기
 *   - 링크 미리보기 수집기: 카카오톡(kakaotalk-scrap), 페이스북, WhatsApp 등
 *   - 점검 도구와 스크립트: Lighthouse, headless 브라우저, curl, wget, python 등
 * `daum`만 쓰지 않는 이유: 다음 앱의 내장 브라우저(DaumApps)는 사람이 쓰는 브라우저다.
 */
const BOT_USER_AGENT = new RegExp(
  [
    'bot|crawl|spider',
    'yeti|daum/|daumoa|slurp|mediapartners|google-inspectiontool|google-pagerenderer|googleweblight',
    'scrap|facebookexternalhit|facebookcatalog|whatsapp|preview',
    'headless|lighthouse|curl|wget|python-requests|python-urllib|go-http-client',
  ].join('|'),
  'i'
);

/**
 * 폰 브라우저의 User-Agent. 아이폰, 안드로이드 폰, 폰 앱의 내장 브라우저는 모두 "Mobile"을 넣어 보낸다.
 * 태블릿은 대부분 넣지 않는다 (아이패드 Safari는 기본으로 PC와 같은 User-Agent를 보낸다).
 * 서버는 화면 폭을 알 수 없으므로, "넓은 화면에서만 보이는 것"을 셀 때 폰을 빼는 용도로 쓴다.
 */
const PHONE_USER_AGENT = /Mobi/i;

/**
 * 중복 방문 확인과 +1을 한 번의 요청으로 처리하는 Lua 스크립트.
 *   KEYS[1] = 방문 표시 키, KEYS[2] = 조회수 해시 / ARGV[1] = 표시를 남겨 둘 시간(초), ARGV[2] = 항목 id
 * 표시가 없을 때만 표시를 남기고 조회수를 올려 새 값을 돌려준다. 이미 있으면 아무것도 하지 않는다.
 * Redis가 스크립트를 한 덩어리로 실행하므로, 표시만 남고 조회수는 오르지 않는 일이 생기지 않는다.
 */
const RECORD_VIEW_SCRIPT = `
if redis.call('SET', KEYS[1], 1, 'NX', 'EX', ARGV[1]) then
  return redis.call('HINCRBY', KEYS[2], ARGV[2], 1)
end
return nil`;

let client: Redis | undefined;

function getRedis(): Redis | null {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    client = new Redis({ url, token });
    return client;
  } catch (error) {
    // 값의 형식이 잘못된 경우 (끝에 공백이 있거나, 따옴표로 감쌌거나, https가 아닌 rediss:// 주소를 넣은 경우 등)
    console.error('Invalid Upstash Redis settings. View counts are disabled:', error);
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * kind에 속한 모든 항목의 조회수 `{ id: 조회수 }`를 읽는다. 한 번도 열리지 않은 항목은 들어 있지 않다.
 * 환경변수가 없거나 읽기에 실패하면 null을 돌려주고, 화면은 조회수를 숨긴다.
 * 기록과 같은 prefix를 읽으므로 로컬 개발 서버에서는 `views-dev`의 숫자가 나온다.
 *
 * layout에서 await 없이 불러 Promise째로 `ViewCountsProvider`에 넘긴다. 그러면 페이지는 Redis를
 * 기다리지 않고 먼저 그려지고, 숫자만 뒤이어 도착한다.
 */
export async function getViewCounts(kind: ViewKind): Promise<ViewCounts | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;

    const raw = await withTimeout(
      redis.hgetall<Record<string, unknown>>(`${KEY_PREFIX}:${kind}`),
      READ_TIMEOUT_MS
    );
    const counts: ViewCounts = {};
    for (const [id, value] of Object.entries(raw ?? {})) {
      const count = Number(value);
      if (Number.isFinite(count)) counts[id] = count;
    }
    return counts;
  } catch (error) {
    console.error(`Failed to read view counts (${kind}):`, error);
    return null;
  }
}

/**
 * 지금 처리 중인 요청을 kind/id 항목의 조회 1회로 기록한다.
 * 개별 주소를 그리는 서버 컴포넌트(page)에서, slug가 실제 항목인지 확인한 뒤에 부른다.
 * 요청 헤더를 읽으므로 요청마다 렌더링되는(dynamic) 페이지에서만 써야 한다.
 *
 * page에서 await 없이 불러 Promise째로 `ViewCountUpdate`에 넘긴다. 그러면 페이지는 Redis를 기다리지 않고,
 * 새 조회수가 도착하는 대로 화면의 숫자만 바뀐다.
 *
 * @param options.skipPhones 폰 브라우저의 요청은 세지 않는다. 넓은 화면에서만 그 항목이 보이는 주소에 쓴다.
 * @returns 이번 요청으로 조회수가 올랐으면 새 조회수. 세지 않았으면(중복 방문, 봇, 폰 제외, 미설정, 실패) null
 */
export async function countPageView(
  kind: ViewKind,
  id: string,
  options: { skipPhones?: boolean } = {}
): Promise<number | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;

    const requestHeaders = await headers();
    const userAgent = requestHeaders.get('user-agent') ?? '';
    if (!userAgent || BOT_USER_AGENT.test(userAgent)) return null;
    if (options.skipPhones && PHONE_USER_AGENT.test(userAgent)) return null;

    // Vercel이 실제 접속 IP로 채우는 헤더. 로컬 개발에서는 없을 수 있다.
    const ip =
      requestHeaders.get('x-real-ip') ??
      requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown';
    // IP·브라우저 정보를 그대로 저장하지 않고 해시로 바꾼다. 토큰을 섞어 값만 보고는 되돌릴 수 없게 한다.
    const visitor = createHash('sha256')
      .update(`${process.env.UPSTASH_REDIS_REST_TOKEN}|${ip}|${userAgent}`)
      .digest('hex')
      .slice(0, 16);

    const recorded = recordView(redis, kind, id, visitor);
    // 화면이 기다리기를 포기한(READ_TIMEOUT_MS) 뒤에도 기록은 끝까지 마치도록, 응답이 끝난 뒤까지 붙잡아 둔다.
    after(() => recorded);

    return await withTimeout(recorded, READ_TIMEOUT_MS);
  } catch (error) {
    console.error(`Failed to count page view (${kind}/${id}):`, error);
    return null;
  }
}

/** 중복 방문이 아니면 조회수를 1 올리고 새 값을 돌려준다. 중복이거나 실패하면 null (예외를 던지지 않는다). */
async function recordView(
  redis: Redis,
  kind: ViewKind,
  id: string,
  visitor: string
): Promise<number | null> {
  const countsKey = `${KEY_PREFIX}:${kind}`;
  try {
    if (!DEDUP_ENABLED) return await redis.hincrby(countsKey, id, 1);

    const seenKey = `${KEY_PREFIX}:seen:${kind}:${id}:${visitor}`;
    return await redis.eval<[number, string], number | null>(
      RECORD_VIEW_SCRIPT,
      [seenKey, countsKey],
      [DEDUP_WINDOW_SECONDS, id]
    );
  } catch (error) {
    console.error(`Failed to record view (${kind}/${id}):`, error);
    return null;
  }
}

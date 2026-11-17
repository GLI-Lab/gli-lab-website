import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * 개별 주소(프로필, 갤러리 앨범)의 조회수를 Upstash Redis에 기록한다. 서버 전용.
 *
 * 세는 기준: 개별 주소에 대한 요청 1건 = 조회 1회.
 *   - 주소로 바로 들어온 경우와, 목록에서 카드를 눌러 주소가 바뀐 경우(router.replace) 모두 서버에 요청이 온다.
 *   - 같은 방문자가 같은 항목을 다시 열어도 24시간에 한 번만 센다.
 *     (카드를 열고 닫기만 해도 `?detail=1`이 붙었다 빠지며 요청이 두 번 오기 때문에 꼭 필요하다.)
 *   - 검색엔진·공유 카드 크롤러와 <Link> 미리 가져오기 요청은 세지 않는다.
 *
 * 저장 형태
 *   - `<prefix>:<kind>`                      해시. 필드 = 항목 id, 값 = 조회수
 *   - `<prefix>:seen:<kind>:<id>:<방문자>`   중복 집계를 막는 표시. 24시간 뒤 자동 삭제
 *   - prefix는 운영 배포면 `views`, 로컬 개발·미리보기 배포면 `views-dev` (운영 숫자를 건드리지 않게 분리)
 *
 * 환경변수 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`이 없으면 아무것도 하지 않는다.
 * 그래서 로컬에 `.env.local`이 없어도 사이트는 그대로 동작한다.
 */

/** 조회수를 세는 대상. 프로필은 주소가 members/alumni로 나뉘므로 따로 센다. */
export type ViewKind = 'members' | 'alumni' | 'gallery';

const DEDUP_WINDOW_SECONDS = 60 * 60 * 24;

const KEY_PREFIX = process.env.VERCEL_ENV === 'production' ? 'views' : 'views-dev';

/** 검색엔진 크롤러, 링크 미리보기 수집기(카카오톡·페이스북 등), 점검 도구 */
const BOT_USER_AGENT = /bot|crawl|spider|slurp|scrap|facebookexternalhit|preview|headless|lighthouse/i;

let client: Redis | undefined;

function getRedis(): Redis | null {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

/**
 * 지금 처리 중인 요청을 kind/id 항목의 조회 1회로 기록한다.
 * 개별 주소를 그리는 서버 컴포넌트(page)에서, slug가 실제 항목인지 확인한 뒤에 부른다.
 * 요청 헤더를 읽으므로 요청마다 렌더링되는(dynamic) 페이지에서만 써야 한다.
 */
export async function countPageView(kind: ViewKind, id: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const requestHeaders = await headers();
  if (
    requestHeaders.has('next-router-prefetch') ||
    requestHeaders.has('next-router-segment-prefetch')
  ) {
    return;
  }

  const userAgent = requestHeaders.get('user-agent') ?? '';
  if (!userAgent || BOT_USER_AGENT.test(userAgent)) return;

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

  // 응답을 보낸 뒤에 기록한다. Redis가 느리거나 실패해도 페이지 응답에는 영향이 없다.
  after(async () => {
    try {
      const seenKey = `${KEY_PREFIX}:seen:${kind}:${id}:${visitor}`;
      const isFirstVisit = await redis.set(seenKey, 1, { nx: true, ex: DEDUP_WINDOW_SECONDS });
      if (isFirstVisit === 'OK') {
        await redis.hincrby(`${KEY_PREFIX}:${kind}`, id, 1);
      }
    } catch (error) {
      console.error(`Failed to record view (${kind}/${id}):`, error);
    }
  });
}

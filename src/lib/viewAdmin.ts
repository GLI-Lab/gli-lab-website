import { getRedis, KEY_PREFIXES, type ViewCounts, type ViewDataset, type ViewKind } from '@/lib/viewStore';
import type { ViewAdminData, ViewAdminResult, ViewLogAction, ViewLogEntry } from '@/lib/viewAdminShared';

/**
 * 관리자 페이지(/admin/views)가 쓰는 조회수 읽기·수정·초기화. 서버 전용.
 * 방문 기록과 화면 표시는 `viewStore.ts`가 하고, 이 파일은 사람이 직접 숫자를 바꾸는 일만 맡는다.
 * 권한 확인은 여기서 하지 않는다. 부르는 쪽(서버 액션)이 먼저 확인한다.
 *
 * 변경 기록
 *   Redis에는 실행 취소가 없어서, 숫자를 바꿀 때마다 바꾸기 전 값과 바꾼 뒤 값을 기록해 둔다.
 *   - 저장 위치: `<prefix>:admin-log:<kind>` (JSON 배열 하나, 새 기록이 앞)
 *   - 최근 20건까지, 마지막 변경 뒤 30일 동안 보관한다.
 *   - 되돌리기는 숫자를 예전 값으로 덮어쓰지 않고 "그때 바뀐 만큼"을 반대로 더한다.
 *     예) 38 → 0 으로 초기화한 뒤 방문이 3번 쌓였으면, 되돌린 결과는 38이 아니라 41이다. 그 사이의 방문이 사라지지 않는다.
 *   - 되돌린 기록은 목록에서 빠지고, 되돌렸다는 기록이 새로 남는다 (이것도 다시 되돌릴 수 있다).
 *
 * 어느 숫자를 바꾸는지: 모든 함수가 첫 인자로 dataset을 받는다. 'production'이면 배포된 사이트가 쌓는 숫자(`views`),
 * 'development'면 로컬 개발 서버가 쌓는 숫자(`views-dev`)다. 둘은 같은 Redis에 있어서, 어느 서버에서 실행하든 둘 다 다룰 수 있다.
 * 변경 기록도 dataset마다 따로 남는다.
 */

const LOG_MAX_ENTRIES = 20;
const LOG_TTL_SECONDS = 60 * 60 * 24 * 30;

const STORE_UNAVAILABLE = '조회수 저장소에 연결할 수 없습니다. 환경변수(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)를 확인하세요.';

const countsKey = (dataset: ViewDataset, kind: ViewKind) => `${KEY_PREFIXES[dataset]}:${kind}`;
const logKey = (dataset: ViewDataset, kind: ViewKind) => `${KEY_PREFIXES[dataset]}:admin-log:${kind}`;

function toCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function toCounts(raw: Record<string, unknown> | null): ViewCounts {
  const counts: ViewCounts = {};
  for (const [id, value] of Object.entries(raw ?? {})) counts[id] = toCount(value);
  return counts;
}

function newEntry(action: ViewLogAction, changes: ViewLogEntry['changes'], undoOf?: ViewLogAction): ViewLogEntry {
  const at = Date.now();
  return { key: `${at}-${Math.random().toString(36).slice(2, 8)}`, at, action, ...(undoOf ? { undoOf } : {}), changes };
}

function failure(action: string, error: unknown): ViewAdminResult {
  console.error(`Failed to ${action}:`, error);
  return { ok: false, message: '저장소 요청이 실패했습니다. 숫자는 바뀌지 않았을 수 있으니 화면을 새로 고쳐 확인하세요.' };
}

/** 조회수 전체와 변경 기록을 읽는다. 저장소를 쓸 수 없으면 null */
export async function readViewAdminData(dataset: ViewDataset, kind: ViewKind): Promise<ViewAdminData | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const [raw, log] = await Promise.all([
      redis.hgetall<Record<string, unknown>>(countsKey(dataset, kind)),
      redis.get<ViewLogEntry[]>(logKey(dataset, kind)),
    ]);
    return {
      counts: toCounts(raw),
      log: Array.isArray(log) ? log : [],
      dataset,
    };
  } catch (error) {
    console.error(`Failed to read view admin data (${dataset}/${kind}):`, error);
    return null;
  }
}

/** 한 항목의 조회수를 value로 바꾼다 */
export async function editViewCount(
  dataset: ViewDataset,
  kind: ViewKind,
  id: string,
  value: number
): Promise<ViewAdminResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, message: STORE_UNAVAILABLE };
  try {
    const [rawBefore, log] = await Promise.all([
      redis.hget<number>(countsKey(dataset, kind), id),
      redis.get<ViewLogEntry[]>(logKey(dataset, kind)),
    ]);
    const before = toCount(rawBefore);
    if (before === value) return { ok: true, message: '이미 같은 값입니다.' };

    const entries = [newEntry('edit', { [id]: [before, value] }), ...(log ?? [])].slice(0, LOG_MAX_ENTRIES);
    await redis
      .multi()
      .hset(countsKey(dataset, kind), { [id]: value })
      .set(logKey(dataset, kind), entries, { ex: LOG_TTL_SECONDS })
      .exec();
    return { ok: true, message: `조회수를 ${before} → ${value}(으)로 바꿨습니다.` };
  } catch (error) {
    return failure(`edit view count (${dataset}/${kind}/${id})`, error);
  }
}

/** 한 항목의 조회수를 0으로 만든다 */
export async function resetViewCount(dataset: ViewDataset, kind: ViewKind, id: string): Promise<ViewAdminResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, message: STORE_UNAVAILABLE };
  try {
    const [rawBefore, log] = await Promise.all([
      redis.hget<number>(countsKey(dataset, kind), id),
      redis.get<ViewLogEntry[]>(logKey(dataset, kind)),
    ]);
    const before = toCount(rawBefore);
    if (before === 0) return { ok: true, message: '이미 0입니다.' };

    const entries = [newEntry('reset', { [id]: [before, 0] }), ...(log ?? [])].slice(0, LOG_MAX_ENTRIES);
    await redis
      .multi()
      .hdel(countsKey(dataset, kind), id)
      .set(logKey(dataset, kind), entries, { ex: LOG_TTL_SECONDS })
      .exec();
    return { ok: true, message: `조회수 ${before}을(를) 0으로 초기화했습니다.` };
  } catch (error) {
    return failure(`reset view count (${dataset}/${kind}/${id})`, error);
  }
}

/** kind에 속한 모든 항목의 조회수를 0으로 만든다 */
export async function resetAllViewCounts(dataset: ViewDataset, kind: ViewKind): Promise<ViewAdminResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, message: STORE_UNAVAILABLE };
  try {
    const [raw, log] = await Promise.all([
      redis.hgetall<Record<string, unknown>>(countsKey(dataset, kind)),
      redis.get<ViewLogEntry[]>(logKey(dataset, kind)),
    ]);
    const changes: ViewLogEntry['changes'] = {};
    for (const [id, count] of Object.entries(toCounts(raw))) {
      if (count !== 0) changes[id] = [count, 0];
    }
    const total = Object.values(changes).reduce((sum, [before]) => sum + before, 0);
    if (total === 0) return { ok: true, message: '이미 모두 0입니다.' };

    const entries = [newEntry('reset-all', changes), ...(log ?? [])].slice(0, LOG_MAX_ENTRIES);
    await redis
      .multi()
      .del(countsKey(dataset, kind))
      .set(logKey(dataset, kind), entries, { ex: LOG_TTL_SECONDS })
      .exec();
    return { ok: true, message: `${Object.keys(changes).length}개 항목, 조회수 합계 ${total}을(를) 0으로 초기화했습니다.` };
  } catch (error) {
    return failure(`reset all view counts (${dataset}/${kind})`, error);
  }
}

/** 변경 기록 한 건을 되돌린다 (그때 바뀐 만큼을 반대로 더한다) */
export async function undoViewChange(
  dataset: ViewDataset,
  kind: ViewKind,
  entryKey: string
): Promise<ViewAdminResult> {
  const redis = getRedis();
  if (!redis) return { ok: false, message: STORE_UNAVAILABLE };
  try {
    const log = (await redis.get<ViewLogEntry[]>(logKey(dataset, kind))) ?? [];
    const entry = log.find((item) => item.key === entryKey);
    if (!entry) return { ok: false, message: '기록을 찾지 못했습니다. 이미 되돌렸거나 보관 기간이 지났습니다.' };

    const ids = Object.keys(entry.changes);
    const increments = redis.multi();
    for (const id of ids) {
      const [before, after] = entry.changes[id];
      increments.hincrby(countsKey(dataset, kind), id, before - after);
    }
    const results = (await increments.exec()) as unknown[];

    // 되돌린 결과와, 음수가 된 항목(그 사이에 숫자를 직접 더 낮춘 경우)을 0으로 맞추는 일을 정리한다.
    const changes: ViewLogEntry['changes'] = {};
    const negatives: Record<string, number> = {};
    ids.forEach((id, index) => {
      const [before, after] = entry.changes[id];
      const result = toCount(results[index]);
      const final = Math.max(result, 0);
      if (result < 0) negatives[id] = 0;
      changes[id] = [result - (before - after), final];
    });

    const entries = [newEntry('undo', changes, entry.action), ...log.filter((item) => item.key !== entryKey)].slice(
      0,
      LOG_MAX_ENTRIES
    );
    const finish = redis.multi();
    if (Object.keys(negatives).length > 0) finish.hset(countsKey(dataset, kind), negatives);
    finish.set(logKey(dataset, kind), entries, { ex: LOG_TTL_SECONDS });
    await finish.exec();

    return { ok: true, message: `${ids.length}개 항목을 되돌렸습니다.` };
  } catch (error) {
    return failure(`undo view change (${dataset}/${kind}/${entryKey})`, error);
  }
}

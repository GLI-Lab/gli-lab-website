'use client';

import {
  createContext,
  Suspense,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { IoEyeOutline } from 'react-icons/io5';

import type { ViewCounts } from '@/lib/viewStore';

/**
 * 조회수 표시.
 *
 * 숫자는 두 경로로 들어온다. 둘 다 서버가 await 없이 Promise째로 넘기므로 페이지는 Redis를 기다리지 않는다.
 *   1. layout → `ViewCountsProvider counts={getViewCounts(kind)}`
 *      페이지를 연 시점의 전체 조회수. layout은 목록 안에서 항목을 바꿔도 다시 그려지지 않는다.
 *   2. page → `ViewCountUpdate id count={countPageView(kind, id)}`
 *      지금 연 항목의 새 조회수. 항목을 열 때마다 page가 다시 그려지며 이번 방문이 반영된 값을 보낸다.
 *
 * 화면에서는 `<ViewCount id="..." />`가 2의 값이 있으면 그것을, 없으면 1의 값을 그린다.
 */
interface ViewCountsContextValue {
  /** 페이지를 연 시점의 조회수 (layout이 넘긴 Promise) */
  counts: Promise<ViewCounts | null>;
  /** 그 뒤에 page가 알려 준 새 조회수 */
  updated: ViewCounts;
  setCount: (id: string, count: number) => void;
}

const ViewCountsContext = createContext<ViewCountsContextValue | null>(null);

export function ViewCountsProvider({
  counts,
  children,
}: {
  counts: Promise<ViewCounts | null>;
  children: ReactNode;
}) {
  const [updated, setUpdated] = useState<ViewCounts>({});
  const setCount = useCallback((id: string, count: number) => {
    setUpdated((prev) => (prev[id] === count ? prev : { ...prev, [id]: count }));
  }, []);
  const value = useMemo(() => ({ counts, updated, setCount }), [counts, updated, setCount]);

  return <ViewCountsContext value={value}>{children}</ViewCountsContext>;
}

function ViewCountValue({
  context,
  id,
  className,
}: {
  context: ViewCountsContextValue;
  id: string;
  className: string;
}) {
  const counts = use(context.counts);
  // page가 알려 준 새 값이 있으면 그것을 쓴다. 처음 읽기에 실패했어도(counts가 null) 새 값은 보여 준다.
  // 읽기에 성공했는데 값이 없는 항목은 한 번도 열리지 않은 것이므로 0이다.
  const views = context.updated[id] ?? (counts ? (counts[id] ?? 0) : null);
  // 조회수 저장소가 설정되지 않았거나 읽지 못했고, 새 값도 받은 적이 없는 경우
  if (views == null) return null;

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 text-[14px] md:text-[15px] font-normal text-gray-500 ${className}`.trim()}
      title="Views"
      aria-label={`${views} views`}
    >
      <IoEyeOutline className="text-[1.15em]" aria-hidden />
      {views.toLocaleString('en-US')}
    </span>
  );
}

/**
 * 한 항목의 조회수 (눈 아이콘 + 숫자). 크기는 여기서 정하고(아이콘은 글자 크기에 비례), 위치는 className으로 준다.
 * `ViewCountsProvider` 밖이거나 조회수를 읽지 못했으면 아무것도 그리지 않는다.
 */
export function ViewCount({ id, className = '' }: { id: string; className?: string }) {
  const context = use(ViewCountsContext);
  if (!context) return null;

  // 숫자가 아직 도착하지 않았으면 이 자리만 비워 두고 나머지 화면은 그대로 그린다.
  return (
    <Suspense fallback={null}>
      <ViewCountValue context={context} id={id} className={className} />
    </Suspense>
  );
}

function ViewCountUpdateValue({ id, count }: { id: string; count: Promise<number | null> }) {
  const setCount = use(ViewCountsContext)?.setCount;
  const newCount = use(count);

  useEffect(() => {
    if (newCount != null) setCount?.(id, newCount);
  }, [id, newCount, setCount]);

  return null;
}

/**
 * 지금 연 항목의 새 조회수를 `ViewCount`에 알린다. 화면에는 아무것도 그리지 않는다.
 * 개별 주소의 page(서버)가 `countPageView()`의 Promise를 넘겨 쓴다. `ViewCountsProvider` 안에 있어야 한다.
 * 이번 방문을 세지 않았으면(중복 방문 등) count가 null이고, 이때는 기존 숫자를 그대로 둔다.
 */
export function ViewCountUpdate({ id, count }: { id: string; count: Promise<number | null> }) {
  return (
    <Suspense fallback={null}>
      <ViewCountUpdateValue id={id} count={count} />
    </Suspense>
  );
}

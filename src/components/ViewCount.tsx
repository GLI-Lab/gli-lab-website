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
  size,
  colorClassName,
  className,
}: {
  context: ViewCountsContextValue;
  id: string;
  size: ViewCountSize;
  colorClassName: string;
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
      className={`inline-flex flex-shrink-0 items-center gap-1 ${SIZE_CLASS[size]} font-normal ${colorClassName} ${className}`.trim()}
      title="Views"
      aria-label={`${views} views`}
    >
      <IoEyeOutline className="text-[1.15em]" aria-hidden />
      {views.toLocaleString('en-US')}
    </span>
  );
}

/**
 * default: 상세 화면·목록형 행에 쓰는 크기.
 * small: 프로필 카드처럼 좁은 자리에 쓰는 크기 (카드의 "See more"와 같다).
 * caption: 갤러리 카드의 날짜 줄과 같은 크기 (화면 폭과 관계없이 14px)
 */
type ViewCountSize = 'default' | 'small' | 'caption';

const SIZE_CLASS: Record<ViewCountSize, string> = {
  default: 'text-[14px] md:text-[15px]',
  small: 'text-xs sm:text-sm',
  caption: 'text-sm',
};

interface ViewCountProps {
  id: string;
  size?: ViewCountSize;
  /** 글자색. 배경이 바뀌는 자리(선택된 카드 등)에서만 바꿔 준다 */
  colorClassName?: string;
  /** 위치·여백·보이기 등 바깥에서 정할 것 */
  className?: string;
}

/**
 * 한 항목의 조회수 (눈 아이콘 + 숫자). 크기는 size로 고르고(아이콘은 글자 크기에 비례), 위치는 className으로 준다.
 * `ViewCountsProvider` 밖이거나 조회수를 읽지 못했으면 아무것도 그리지 않는다.
 */
export function ViewCount({ id, size = 'default', colorClassName = 'text-gray-500', className = '' }: ViewCountProps) {
  const context = use(ViewCountsContext);
  if (!context) return null;

  // 숫자가 아직 도착하지 않았으면 이 자리만 비워 두고 나머지 화면은 그대로 그린다.
  return (
    <Suspense fallback={null}>
      <ViewCountValue context={context} id={id} size={size} colorClassName={colorClassName} className={className} />
    </Suspense>
  );
}

function ViewCountsToggleButton({
  context,
  pressed,
  onChange,
  onPreview,
  className,
}: {
  context: ViewCountsContextValue;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  onPreview?: (previewing: boolean) => void;
  className: string;
}) {
  const counts = use(context.counts);
  // 조회수를 하나도 그릴 수 없으면(ViewCount가 아무것도 그리지 않는 경우와 같다) 버튼도 쓸모가 없다
  if (!counts && Object.keys(context.updated).length === 0) return null;

  // 테두리 없이 눈 모양만 그린다. 꺼져 있으면 연한 회색, 켜져 있으면 브랜드 초록에 선이 조금 두껍다.
  // 안쪽 여백(누르는 영역)과 위치는 놓이는 자리마다 달라서 className으로 받는다
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label="Always show view counts"
      title={pressed ? 'Hide view counts' : 'Show view counts'}
      onClick={() => {
        onChange(!pressed);
        // 누른 뒤에는 미리 보기를 끝낸다: 마우스가 아직 버튼 위에 있어도, 끄면 조회수가 바로 사라져야 꺼진 줄 안다
        onPreview?.(false);
      }}
      // 미리 보기: 마우스를 버튼에 올리고 있는 동안. 터치는 뗀 뒤에도 "올린 상태"가 남으므로 마우스일 때만 한다
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onPreview?.(true);
      }}
      onPointerLeave={() => onPreview?.(false)}
      className={`inline-flex flex-shrink-0 items-center justify-center text-[22px] md:text-[24px] transition-colors ${
        pressed ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-500'
      } ${className}`.trim()}
    >
      {/* 켜져 있으면 선을 조금 두껍게 한다: 색만 바뀌어서는 켜졌는지 알아보기 어렵다.
          아이콘의 선 굵기는 원래 32 (512 기준. 24px로 그리면 1.5px)이고, 10% 늘린 35.2면 1.65px이다 */}
      <IoEyeOutline aria-hidden className={pressed ? '[&>*]:[stroke-width:35.2]' : undefined} />
    </button>
  );
}

interface ViewCountsToggleProps {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  /** 마우스를 버튼에 올리고 있는 동안 true. 누르지 않아도 조회수를 미리 보여 주는 데 쓴다 */
  onPreview?: (previewing: boolean) => void;
  /** 안쪽 여백(누르는 영역), 위치 등 바깥에서 정할 것 */
  className?: string;
}

/**
 * 조회수를 늘 보여 줄지 고르는 눈 모양 버튼 (누르면 눈 모양이 브랜드 초록이 되고 선이 조금 두꺼워진다). 켜짐 여부는 쓰는 쪽이 들고 있다가
 * 각 항목의 `ViewCount`를 숨길지 정하는 데 쓴다
 * (갤러리 목록과 프로필 카드 목록 — 꺼져 있으면 카드에 마우스를 올렸을 때만, 켜져 있으면 늘 보인다).
 * 누르지 않고 버튼에 마우스만 올려도 그동안은 보여 줄 수 있게, 올렸는지를 onPreview로 알린다.
 * `ViewCountsProvider` 밖이거나 조회수를 읽지 못했으면 버튼도 그리지 않는다.
 */
export function ViewCountsToggle({ pressed, onChange, onPreview, className = '' }: ViewCountsToggleProps) {
  const context = use(ViewCountsContext);
  if (!context) return null;

  return (
    <Suspense fallback={null}>
      <ViewCountsToggleButton
        context={context}
        pressed={pressed}
        onChange={onChange}
        onPreview={onPreview}
        className={className}
      />
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

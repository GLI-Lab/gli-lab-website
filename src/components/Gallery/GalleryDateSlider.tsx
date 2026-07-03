'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  type RefObject,
  type CSSProperties,
} from 'react';
import { getSortableDate } from './helpers';

// ─── Layout breakpoints (single subscription, hydration-safe) ───────────────

const MD_MIN_WIDTH_QUERY = '(min-width: 768px)';
const XL_MIN_WIDTH_QUERY = '(min-width: 1280px)';
const GALLERY_SLIDER_MARK_COUNT_BELOW_MD = 6;
const GALLERY_SLIDER_MARK_COUNT_MD_UP = 8;
const GALLERY_SLIDER_MARK_COUNT_XL_UP = 10;

type GallerySliderLayoutTier = 'below-md' | 'md' | 'xl';
type GallerySliderLabelFormat = 'yy' | 'yyyy';

interface SliderThumbLayout {
  sidePadRem: number;
  thumbHalfRem: number;
  thumbWidthRem: number;
}

interface GalleryLayout {
  isMdUp: boolean;
  tier: GallerySliderLayoutTier;
  labelFormat: GallerySliderLabelFormat;
  sliderMarkCount: number;
  thumbLayout: SliderThumbLayout;
}

const THUMB_LAYOUT_MD: SliderThumbLayout = {
  sidePadRem: 1,
  thumbHalfRem: 1.75,
  thumbWidthRem: 3.5,
};
const THUMB_LAYOUT_BELOW_MD: SliderThumbLayout = {
  sidePadRem: 0.5,
  thumbHalfRem: 1.25,
  thumbWidthRem: 2.5,
};

const layoutCache = new Map<string, GalleryLayout>();

function resolveSliderMarkCount(tier: GallerySliderLayoutTier, markOverride?: number | null): number {
  if (markOverride != null) return markOverride;
  if (tier === 'xl') return GALLERY_SLIDER_MARK_COUNT_XL_UP;
  if (tier === 'md') return GALLERY_SLIDER_MARK_COUNT_MD_UP;
  return GALLERY_SLIDER_MARK_COUNT_BELOW_MD;
}

function getCachedGalleryLayout(
  tier: GallerySliderLayoutTier,
  isMdUp: boolean,
  sliderMarkCount: number
): GalleryLayout {
  const key = `${tier}:${sliderMarkCount}`;
  const cached = layoutCache.get(key);
  if (cached) return cached;

  const layout: GalleryLayout = {
    isMdUp,
    tier,
    labelFormat: isMdUp ? 'yyyy' : 'yy',
    sliderMarkCount,
    thumbLayout: isMdUp ? THUMB_LAYOUT_MD : THUMB_LAYOUT_BELOW_MD,
  };
  layoutCache.set(key, layout);
  return layout;
}

function readGalleryLayout(markOverride?: number | null): GalleryLayout {
  const isMdUp =
    typeof window !== 'undefined' && window.matchMedia(MD_MIN_WIDTH_QUERY).matches;
  const isXlUp =
    typeof window !== 'undefined' && window.matchMedia(XL_MIN_WIDTH_QUERY).matches;
  const tier: GallerySliderLayoutTier = isXlUp ? 'xl' : isMdUp ? 'md' : 'below-md';
  const sliderMarkCount = resolveSliderMarkCount(tier, markOverride);
  return getCachedGalleryLayout(tier, isMdUp, sliderMarkCount);
}

const serverSnapshotCache = new Map<string, GalleryLayout>();

/** SSR·hydration 공통 — 항상 below-md. 클라이언트 matchMedia는 읽지 않음 (hydration mismatch 방지) */
function getGalleryLayoutServerSnapshot(markOverride?: number | null): GalleryLayout {
  const sliderMarkCount = resolveSliderMarkCount('below-md', markOverride);
  const key = `below-md:${sliderMarkCount}`;
  const cached = serverSnapshotCache.get(key);
  if (cached) return cached;

  const layout = getCachedGalleryLayout('below-md', false, sliderMarkCount);
  serverSnapshotCache.set(key, layout);
  return layout;
}

const layoutListeners = new Set<() => void>();
let layoutMediaSubscribed = false;

function ensureGalleryLayoutMediaSubscription() {
  if (layoutMediaSubscribed || typeof window === 'undefined') return;
  layoutMediaSubscribed = true;

  const notify = () => layoutListeners.forEach((listener) => listener());
  window.matchMedia(MD_MIN_WIDTH_QUERY).addEventListener('change', notify);
  window.matchMedia(XL_MIN_WIDTH_QUERY).addEventListener('change', notify);
}

function subscribeGalleryLayout(onStoreChange: () => void) {
  layoutListeners.add(onStoreChange);
  ensureGalleryLayoutMediaSubscription();
  return () => layoutListeners.delete(onStoreChange);
}

/** SSR·hydration은 below-md — 마운트 후 getSnapshot이 실제 뷰포트 반영 */
export function useGalleryLayout(markOverride?: number | null, enabled = true): GalleryLayout {
  const overrideRef = useRef(markOverride);
  overrideRef.current = markOverride;

  const liveLayout = useSyncExternalStore(
    subscribeGalleryLayout,
    () => readGalleryLayout(overrideRef.current),
    () => getGalleryLayoutServerSnapshot(overrideRef.current)
  );

  if (!enabled) {
    return getGalleryLayoutServerSnapshot(overrideRef.current);
  }
  return liveLayout;
}

// ─── 날짜 구간(슬라이더 눈금) & scroll helpers ───────────────────────────────

interface GalleryDateAnchor {
  itemId: string;
  label: string;
}

const GALLERY_FOCAL_VIEWPORT_RATIO = 0.5;

function formatGallerySliderMarkLabel(
  source: string | number | undefined,
  format: GallerySliderLabelFormat
): string {
  const d = typeof source === 'number' ? new Date(source) : getSortableDate(source);
  if (d.getTime() === 0) return '';

  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const year =
    format === 'yyyy'
      ? String(d.getFullYear())
      : String(d.getFullYear() % 100).padStart(2, '0');
  return `${year}.${mm}`;
}

function getLayoutDocumentTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function getHeaderStickyTopPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim();
  return Number.parseFloat(raw) || 76;
}

function getGalleryYearNavStickyScrollY(nav: HTMLElement | null): number {
  if (typeof window === 'undefined') return 0;

  const stickyTop =
    (nav && Number.parseFloat(getComputedStyle(nav).top)) || getHeaderStickyTopPx();

  const origin = document.querySelector<HTMLElement>('[data-gallery-sticky-origin]');
  if (origin && getComputedStyle(origin).display !== 'none') {
    return Math.max(0, getLayoutDocumentTop(origin) - stickyTop);
  }

  if (nav && getComputedStyle(nav).display !== 'none') {
    return Math.max(0, getLayoutDocumentTop(nav) - stickyTop);
  }

  const gridWrap = document.querySelector<HTMLElement>('[data-gallery-grid-wrap]');
  if (gridWrap) {
    return Math.max(0, getLayoutDocumentTop(gridWrap) - stickyTop);
  }

  const total = document.querySelector<HTMLElement>('[data-gallery-total]');
  if (total) {
    return Math.max(0, getLayoutDocumentTop(total) - stickyTop);
  }

  return 0;
}

function getFocalAlignedScrollY(el: HTMLElement): number {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const itemTop = el.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, itemTop - viewportHeight * GALLERY_FOCAL_VIEWPORT_RATIO + 1);
}

/** 네이티브 smooth 스크롤은 거리에 비례해 애니메이션이 길어져, 아이템이 많으면
 *  (특히 모바일에서) 눈금 클릭 시 스크롤이 과도하게 오래 걸린다. 목표가 멀면 근처까지
 *  즉시 점프한 뒤 마지막 구간만 smooth로 이동해 소요 시간을 일정하게 제한한다. */
export function scrollToY(top: number, behavior: ScrollBehavior): void {
  if (typeof window === 'undefined') return;

  if (behavior === 'smooth') {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxAnimatedDistance = viewportHeight * 2;
    const distance = Math.abs(top - window.scrollY);
    if (distance > maxAnimatedDistance) {
      const preJump = top > window.scrollY ? top - maxAnimatedDistance : top + maxAnimatedDistance;
      window.scrollTo({ top: preJump, behavior: 'auto' });
    }
  }

  window.scrollTo({ top, behavior });
}

export function resolveGalleryScrollTargetY(
  itemId: string,
  getItemElement: (itemId: string) => HTMLElement | null,
  options?: { scrollToGalleryTop?: boolean }
): number | null {
  if (typeof window === 'undefined') return null;

  const verticalSliderScrollOffsetPx = window.matchMedia('(min-width: 1601px)').matches ? 70 : 0;

  if (options?.scrollToGalleryTop) {
    const nav = document.querySelector<HTMLElement>('[data-gallery-year-nav]');
    return Math.max(0, getGalleryYearNavStickyScrollY(nav) - verticalSliderScrollOffsetPx);
  }

  const el = getItemElement(itemId);
  if (!el) return null;

  const nav = document.querySelector<HTMLElement>('[data-gallery-year-nav]');
  const galleryTopY = getGalleryYearNavStickyScrollY(nav);
  // sticky 경계값에 정확히 착지하면 stuck/unstuck이 서브픽셀로 흔들릴 수 있어 1px 안쪽으로.
  const focalY = Math.max(galleryTopY + 1, getFocalAlignedScrollY(el));
  return Math.max(0, focalY - verticalSliderScrollOffsetPx);
}

function resolveActiveSliderMarkIndex(
  anchors: GalleryDateAnchor[],
  getItemElement: (itemId: string) => HTMLElement | null,
  options?: {
    defaultIndex?: number;
    stickyScrollY?: number | null;
  }
): number | null {
  if (typeof window === 'undefined') return null;
  if (anchors.length === 0) return null;
  if (anchors.length === 1) return 0;

  const defaultIndex = options?.defaultIndex ?? anchors.length - 1;

  if (options?.stickyScrollY != null && window.scrollY <= options.stickyScrollY + 8) {
    return defaultIndex;
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const focalY = window.scrollY + viewportHeight * GALLERY_FOCAL_VIEWPORT_RATIO;

  let active = -1;
  let activeTop = -Infinity;
  let topmostIndex = defaultIndex;
  let topmostTop = Infinity;
  let foundAny = false;

  for (let i = 0; i < anchors.length; i++) {
    const el = getItemElement(anchors[i].itemId);
    if (!el) continue;

    foundAny = true;
    const top = el.getBoundingClientRect().top + window.scrollY;

    if (top < topmostTop) {
      topmostTop = top;
      topmostIndex = i;
    }
    if (top <= focalY && top > activeTop) {
      activeTop = top;
      active = i;
    }
  }

  if (!foundAny) return null;
  return active >= 0 ? active : topmostIndex;
}

export function buildGallerySliderMarks(
  items: { id: string; date?: string }[],
  sliderMarkCount = 5,
  labelFormat: GallerySliderLabelFormat = 'yy'
): GalleryDateAnchor[] {
  const dated = items
    .map((item) => {
      const sortable = getSortableDate(item.date);
      const label = formatGallerySliderMarkLabel(item.date, labelFormat);
      if (!label || sortable.getTime() === 0) return null;
      return { itemId: item.id, label, sortKey: sortable.getTime() };
    })
    .filter((a): a is { itemId: string; label: string; sortKey: number } => a != null)
    .sort((a, b) => a.sortKey - b.sortKey);

  if (dated.length === 0) return [];
  if (dated.length === 1) {
    return [{ itemId: dated[0].itemId, label: dated[0].label }];
  }

  const n = Math.max(2, sliderMarkCount);
  const minTime = dated[0].sortKey;
  const maxTime = dated[dated.length - 1].sortKey;

  if (minTime === maxTime) {
    return [{ itemId: dated[dated.length - 1].itemId, label: dated[dated.length - 1].label }];
  }

  const anchors: GalleryDateAnchor[] = [];

  for (let i = 0; i < n; i++) {
    const targetTime = minTime + (i / (n - 1)) * (maxTime - minTime);
    const label = formatGallerySliderMarkLabel(targetTime, labelFormat);

    let bestIdx = 0;
    let bestDist = Infinity;
    dated.forEach((entry, idx) => {
      const dist = Math.abs(entry.sortKey - targetTime);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    anchors.push({ itemId: dated[bestIdx].itemId, label });
  }

  anchors[0] = {
    itemId: dated[0].itemId,
    label: formatGallerySliderMarkLabel(dated[0].sortKey, labelFormat),
  };
  anchors[n - 1] = {
    itemId: dated[dated.length - 1].itemId,
    label: formatGallerySliderMarkLabel(dated[dated.length - 1].sortKey, labelFormat),
  };

  return anchors;
}

// ─── 가로형·세로형 날짜 슬라이더 ────────────────────────────────────────────

/** 세로형 슬라이더(1601px+) nav 왼쪽 여백 — gallery-rail breakpoint와 대응 */
const GALLERY_RAIL_SIDE_MARGIN_PX = 12;
const SCRUB_MOVE_THRESHOLD = 4;
const SCROLL_SYNC_SETTLE_TOLERANCE_PX = 8;
/** scrollend·목표 위치 도달로 풀리지 않을 때만 쓰는 안전장치 (거리·아이템 수와 무관) */
const SCROLL_SYNC_SETTLE_MAX_MS = 15000;

export type GalleryDateSliderSelectOptions = { scrollToGalleryTop?: boolean };

interface GalleryDateSliderProps {
  anchors: GalleryDateAnchor[];
  thumbLayout: SliderThumbLayout;
  onSelectSliderMark: (
    itemId: string,
    behavior?: ScrollBehavior,
    options?: GalleryDateSliderSelectOptions
  ) => void;
  getItemElement: (itemId: string) => HTMLElement | null;
  getScrollTargetY: (
    itemId: string,
    options?: GalleryDateSliderSelectOptions
  ) => number | null;
}

/** PaperList 컨트롤박스 비활성 필터 버튼과 동일한 snap point 호버 */
const GALLERY_SLIDER_MARK_INACTIVE_CLASS =
  'cursor-pointer font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900';

const GALLERY_SLIDER_MARK_ACTIVE_CLASS =
  'pointer-events-none bg-brand-primary font-semibold text-white shadow-sm';

/** 가로형 슬라이더 snap point — 활성·호버 공통 박스 크기 */
const GALLERY_SLIDER_MARK_BOX_FLOATING =
  'flex min-w-[2.5rem] items-center justify-center rounded px-1.5 text-xs tabular-nums md:min-w-[3.5rem] md:rounded-md md:px-2.5 md:text-sm';

const GALLERY_SLIDER_MARK_BOX_FLOATING_POSITION =
  'absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 md:top-0.5 md:bottom-0.5 xl:top-1 xl:bottom-1';

/** 세로형 슬라이더 snap point — 활성·호버 공통 박스 크기 */
const GALLERY_SLIDER_MARK_BOX_RAIL =
  'flex min-w-[4.75rem] items-center justify-center rounded-md px-2.5 py-1.5 text-sm tabular-nums';

function stopGalleryClickPropagation(e: React.MouseEvent<HTMLElement>) {
  e.stopPropagation();
}

function thumbLeftCss(ratio: number, layout: SliderThumbLayout) {
  const { sidePadRem, thumbHalfRem, thumbWidthRem } = layout;
  return `calc(${sidePadRem}rem + ${thumbHalfRem}rem + (100% - ${sidePadRem * 2}rem - ${thumbWidthRem}rem) * ${ratio})`;
}

function thumbRatioFromIndex(index: number, count: number) {
  if (count <= 1) return 0;
  return index / (count - 1);
}

function indexFromThumbRatio(ratio: number, count: number) {
  if (count <= 1) return 0;
  if (!Number.isFinite(ratio)) return count - 1;
  return Math.round(Math.max(0, Math.min(1, ratio)) * (count - 1));
}

function thumbGapSegmentStyle(
  leftIndex: number,
  count: number,
  layout: SliderThumbLayout
): CSSProperties {
  const { sidePadRem, thumbWidthRem } = layout;
  const leftRatio = thumbRatioFromIndex(leftIndex, count);
  const rightRatio = thumbRatioFromIndex(leftIndex + 1, count);
  const span = rightRatio - leftRatio;
  const endInset = 0.35;
  const innerSpan = span * Math.max(0, 1 - endInset * 2);
  const startRatio = leftRatio + span * endInset;

  return {
    left: thumbLeftCss(startRatio, layout),
    width: `calc((100% - ${sidePadRem * 2}rem - ${thumbWidthRem}rem) * ${innerSpan})`,
  };
}

function useGalleryItemScrollActiveIndex(
  anchors: GalleryDateAnchor[],
  getItemElement: (itemId: string) => HTMLElement | null,
  isScrubbing: boolean,
  defaultIndex: number,
  getStickyScrollY?: () => number | null
) {
  const anchorCount = anchors.length;
  const defaultIndexRef = useRef(defaultIndex);
  defaultIndexRef.current = defaultIndex;

  const clampDefaultIndex = useCallback((count: number) => {
    if (count < 2) return 0;
    return Math.max(0, Math.min(defaultIndexRef.current, count - 1));
  }, []);

  const [activeIndex, setActiveIndex] = useState(() => clampDefaultIndex(anchorCount));
  const isScrubbingRef = useRef(isScrubbing);
  const isScrollSyncPausedRef = useRef(false);
  const scrollSettleCleanupRef = useRef<(() => void) | null>(null);
  const getItemElementRef = useRef(getItemElement);
  const anchorsRef = useRef(anchors);
  const getStickyScrollYRef = useRef(getStickyScrollY);

  useEffect(() => {
    getItemElementRef.current = getItemElement;
  }, [getItemElement]);

  useEffect(() => {
    anchorsRef.current = anchors;
  }, [anchors]);

  useEffect(() => {
    isScrubbingRef.current = isScrubbing;
  }, [isScrubbing]);

  useEffect(() => {
    getStickyScrollYRef.current = getStickyScrollY;
  }, [getStickyScrollY]);

  const syncFromScroll = useCallback(() => {
    if (anchorCount < 2 || isScrubbingRef.current || isScrollSyncPausedRef.current) return;

    const next = resolveActiveSliderMarkIndex(
      anchorsRef.current,
      getItemElementRef.current,
      {
        defaultIndex: defaultIndexRef.current,
        stickyScrollY: getStickyScrollYRef.current?.() ?? null,
      }
    );
    if (next === null || !Number.isFinite(next)) return;

    const clamped = Math.max(0, Math.min(next, anchorCount - 1));
    setActiveIndex((prev) => (prev === clamped ? prev : clamped));
  }, [anchorCount]);

  useLayoutEffect(() => {
    if (anchorCount < 2) return;

    let next = clampDefaultIndex(anchorCount);
    const synced = resolveActiveSliderMarkIndex(
      anchorsRef.current,
      getItemElementRef.current,
      {
        defaultIndex: defaultIndexRef.current,
        stickyScrollY: getStickyScrollYRef.current?.() ?? null,
      }
    );
    if (synced !== null && Number.isFinite(synced)) {
      next = Math.max(0, Math.min(synced, anchorCount - 1));
    }

    setActiveIndex(next);
  }, [anchorCount, clampDefaultIndex]);

  const pauseScrollSyncUntilSettled = useCallback(
    (expectedIndex: number, targetScrollY?: number | null) => {
      scrollSettleCleanupRef.current?.();

      isScrollSyncPausedRef.current = true;
      let settled = false;

      const canResume = () => {
        const next = resolveActiveSliderMarkIndex(
          anchorsRef.current,
          getItemElementRef.current,
          {
            defaultIndex: defaultIndexRef.current,
            stickyScrollY: getStickyScrollYRef.current?.() ?? null,
          }
        );
        if (next !== expectedIndex) return false;
        if (
          targetScrollY != null &&
          Math.abs(window.scrollY - targetScrollY) > SCROLL_SYNC_SETTLE_TOLERANCE_PX
        ) {
          return false;
        }
        return true;
      };

      const resume = () => {
        if (settled || !canResume()) return;
        settled = true;
        isScrollSyncPausedRef.current = false;
        scrollSettleCleanupRef.current = null;
        window.clearTimeout(safetyTimeout);
        window.removeEventListener('scrollend', tryResume);
        window.removeEventListener('scroll', tryResume);
      };

      const tryResume = () => resume();

      const safetyTimeout = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        isScrollSyncPausedRef.current = false;
        scrollSettleCleanupRef.current = null;
        window.removeEventListener('scrollend', tryResume);
        window.removeEventListener('scroll', tryResume);
      }, SCROLL_SYNC_SETTLE_MAX_MS);

      window.addEventListener('scrollend', tryResume);
      window.addEventListener('scroll', tryResume, { passive: true });
      scrollSettleCleanupRef.current = () => {
        if (settled) return;
        settled = true;
        isScrollSyncPausedRef.current = false;
        scrollSettleCleanupRef.current = null;
        window.clearTimeout(safetyTimeout);
        window.removeEventListener('scrollend', tryResume);
        window.removeEventListener('scroll', tryResume);
      };
    },
    []
  );

  useEffect(() => () => scrollSettleCleanupRef.current?.(), []);

  useEffect(() => {
    if (anchorCount < 2) return;
    syncFromScroll();
  }, [anchorCount, syncFromScroll]);

  useEffect(() => {
    if (anchorCount < 2) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncFromScroll);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);

    const pageRo = new ResizeObserver(schedule);
    pageRo.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      pageRo.disconnect();
    };
  }, [anchorCount, syncFromScroll]);

  return [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled] as const;
}

function useGalleryStickyScrollY(navRef?: RefObject<HTMLElement | null>) {
  return useCallback(() => {
    const nav = navRef?.current ?? document.querySelector<HTMLElement>('[data-gallery-year-nav]');
    return getGalleryYearNavStickyScrollY(nav);
  }, [navRef]);
}

function useSelectSliderMarkAtIndex(
  anchors: GalleryDateAnchor[],
  onSelectSliderMark: GalleryDateSliderProps['onSelectSliderMark'],
  setActiveIndex: (index: number) => void,
  pauseScrollSyncUntilSettled: (expectedIndex: number, targetScrollY?: number | null) => void,
  getScrollTargetY: GalleryDateSliderProps['getScrollTargetY']
) {
  const lastScrolledItemIdRef = useRef<string | null>(null);

  const selectAtIndex = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const clamped = Math.max(0, Math.min(index, anchors.length - 1));
      const itemId = anchors[clamped]?.itemId;
      if (!itemId) return;

      setActiveIndex(clamped);

      if (lastScrolledItemIdRef.current === itemId) return;

      lastScrolledItemIdRef.current = itemId;
      const isNewestMark = clamped === anchors.length - 1;
      const scrollOptions = isNewestMark ? { scrollToGalleryTop: true as const } : undefined;
      const targetY = getScrollTargetY(itemId, scrollOptions);
      pauseScrollSyncUntilSettled(clamped, targetY);
      onSelectSliderMark(itemId, behavior, scrollOptions);
    },
    [anchors, getScrollTargetY, onSelectSliderMark, pauseScrollSyncUntilSettled, setActiveIndex]
  );

  const clearLastScrolledItem = useCallback(() => {
    lastScrolledItemIdRef.current = null;
  }, []);

  return { selectAtIndex, clearLastScrolledItem };
}

/** 1600px 이하 — 상단 sticky 가로형 날짜 슬라이더 */
export function GalleryDateSliderFloating({
  anchors,
  thumbLayout,
  onSelectSliderMark,
  getItemElement,
  getScrollTargetY,
}: GalleryDateSliderProps) {
  const navRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const getStickyScrollY = useGalleryStickyScrollY(navRef);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled] =
    useGalleryItemScrollActiveIndex(
    anchors,
    getItemElement,
    isScrubbing,
    anchors.length - 1,
    getStickyScrollY
  );
  const { selectAtIndex, clearLastScrolledItem } = useSelectSliderMarkAtIndex(
    anchors,
    onSelectSliderMark,
    setActiveIndex,
    pauseScrollSyncUntilSettled,
    getScrollTargetY
  );
  const movedDuringScrubRef = useRef(false);
  const scrubOriginXRef = useRef(0);
  // 드래그 중 sticky nav는 스크롤 점프마다 재배치·래스터 대상이 되어 깜빡인다.
  // 실제 드래그가 시작되면 fixed로 전환해 문서 스크롤에서 완전히 분리한다.
  const [isDragging, setIsDragging] = useState(false);
  const navHeightRef = useRef(0);

  const resolveThumbRatioFromClientX = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || anchors.length < 2) return 0;

      const rect = track.getBoundingClientRect();
      const sidePadPx = thumbLayout.sidePadRem * 16;
      const thumbHalfPx = thumbLayout.thumbHalfRem * 16;
      const minCenter = rect.left + sidePadPx + thumbHalfPx;
      const maxCenter = rect.right - sidePadPx - thumbHalfPx;
      const usableWidth = maxCenter - minCenter;
      if (usableWidth <= 0) return 0;

      return Math.max(0, Math.min(1, (clientX - minCenter) / usableWidth));
    },
    [anchors.length, thumbLayout]
  );

  const resolveIndexFromClientX = useCallback(
    (clientX: number): number =>
      indexFromThumbRatio(resolveThumbRatioFromClientX(clientX), anchors.length),
    [anchors.length, resolveThumbRatioFromClientX]
  );

  const selectFromClientX = useCallback(
    (clientX: number, behavior: ScrollBehavior) => {
      selectAtIndex(resolveIndexFromClientX(clientX), behavior);
    },
    [resolveIndexFromClientX, selectAtIndex]
  );

  const endScrub = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsScrubbing(false);
      setIsDragging(false);
      clearLastScrolledItem();
      movedDuringScrubRef.current = false;
    },
    [clearLastScrolledItem]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsScrubbing(true);
      movedDuringScrubRef.current = false;
      scrubOriginXRef.current = e.clientX;
      clearLastScrolledItem();
    },
    [clearLastScrolledItem]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

      if (
        !movedDuringScrubRef.current &&
        Math.abs(e.clientX - scrubOriginXRef.current) > SCRUB_MOVE_THRESHOLD
      ) {
        movedDuringScrubRef.current = true;
        // fixed 전환 시 flow에서 빠지는 만큼 스페이서로 채우기 위해 현재 높이를 기록
        navHeightRef.current = navRef.current?.offsetHeight ?? 0;
        setIsDragging(true);
      }

      if (movedDuringScrubRef.current) {
        selectFromClientX(e.clientX, 'auto');
      }
    },
    [selectFromClientX]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (movedDuringScrubRef.current) {
        selectFromClientX(e.clientX, 'auto');
      } else {
        selectAtIndex(resolveIndexFromClientX(e.clientX), 'smooth');
      }
      endScrub(e);
    },
    [endScrub, selectAtIndex, selectFromClientX, resolveIndexFromClientX]
  );

  if (anchors.length < 2) return null;

  const activeLabel = anchors[activeIndex]?.label ?? '';

  return (
    <>
      <div data-gallery-sticky-origin className="gallery-rail:hidden h-0 w-full" aria-hidden />
      {/* 드래그 중 sticky nav는 스크롤 점프마다 브라우저가 위치 재계산·재래스터를 하며
          한 프레임씩 사라지는 깜빡임이 발생 → 실제 드래그가 시작되면 fixed로 전환해
          문서 스크롤에서 완전히 분리하고, flow에서 빠진 높이는 스페이서로 유지한다. */}
      {isDragging && (
        <div
          className="gallery-rail:hidden mb-2 md:mb-3"
          style={{ height: navHeightRef.current }}
          aria-hidden
        />
      )}
      <nav
        ref={navRef}
        aria-label="날짜별 탐색"
        data-gallery-year-nav
        className={`gallery-rail:hidden z-20 will-change-transform ${
          isDragging
            ? 'fixed inset-x-0 top-[var(--header-height,76px)] bg-white py-1.5 sm:py-2 md:py-3'
            : `sticky top-[var(--header-height,76px)] -mx-4 mb-2 px-4 py-1.5 sm:py-2 md:-mx-6 md:mb-3 md:px-6 md:py-3 ${
                isScrubbing
                  ? 'bg-white'
                  : 'bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80'
              }`
        }`}
      >
        <div className={isDragging ? 'mx-auto max-w-screen-xl px-4 md:px-6' : undefined}>
        <div className="w-full rounded-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm font-medium md:px-2 md:py-1">
          <div
            ref={trackRef}
            className="relative h-7 cursor-pointer touch-none select-none py-0 sm:h-8 sm:py-0.5 md:h-9 md:py-0.5 xl:h-10 xl:py-0.5"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={stopGalleryClickPropagation}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={anchors.length - 1}
            aria-valuenow={activeIndex}
            aria-valuetext={activeLabel}
          >
            {anchors.length > 1 &&
              Array.from({ length: anchors.length - 1 }, (_, index) => (
                <span
                  key={`rail-${index}`}
                  className="pointer-events-none absolute top-1/2 z-0 h-0 -translate-y-1/2 border-t md:border-t-[1.25px] border-dashed border-gray-400"
                  style={thumbGapSegmentStyle(index, anchors.length, thumbLayout)}
                  aria-hidden
                />
              ))}

            {anchors.map((anchor, index) => {
              const isActive = index === activeIndex;
              const ratio = thumbRatioFromIndex(index, anchors.length);
              return (
                <div
                  key={`${anchor.itemId}-${index}`}
                  className={`z-[1] ${GALLERY_SLIDER_MARK_BOX_FLOATING_POSITION} ${GALLERY_SLIDER_MARK_BOX_FLOATING} ${
                    isActive ? GALLERY_SLIDER_MARK_ACTIVE_CLASS : GALLERY_SLIDER_MARK_INACTIVE_CLASS
                  }`}
                  style={{
                    left: thumbLeftCss(ratio, thumbLayout),
                    transform: 'translateX(-50%)',
                  }}
                  aria-hidden={isActive}
                >
                  {anchor.label}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </nav>
    </>
  );
}

/** 1601px 이상 — 그리드 오른쪽 세로형 날짜 슬라이더 */
export function GalleryDateSliderRail({
  anchors,
  onSelectSliderMark,
  getItemElement,
  getScrollTargetY,
}: Omit<GalleryDateSliderProps, 'thumbLayout'>) {
  const navRef = useRef<HTMLElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const getStickyScrollY = useGalleryStickyScrollY();
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled] =
    useGalleryItemScrollActiveIndex(
    anchors,
    getItemElement,
    isScrubbing,
    anchors.length - 1,
    getStickyScrollY
  );
  const { selectAtIndex, clearLastScrolledItem } = useSelectSliderMarkAtIndex(
    anchors,
    onSelectSliderMark,
    setActiveIndex,
    pauseScrollSyncUntilSettled,
    getScrollTargetY
  );
  const movedDuringScrubRef = useRef(false);
  const scrubOriginYRef = useRef(0);

  const resolveIndexFromClientY = useCallback(
    (clientY: number): number => {
      const nav = navRef.current;
      if (!nav || anchors.length === 0) return 0;

      const marks = nav.querySelectorAll<HTMLElement>('[data-rail-index]');
      if (marks.length === 0) return 0;

      let closestIndex = 0;
      let closestDistance = Infinity;

      marks.forEach((mark, index) => {
        const rect = mark.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distance = Math.abs(clientY - centerY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    },
    [anchors.length]
  );

  const selectFromClientY = useCallback(
    (clientY: number, behavior: ScrollBehavior) => {
      selectAtIndex(resolveIndexFromClientY(clientY), behavior);
    },
    [resolveIndexFromClientY, selectAtIndex]
  );

  const endScrub = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setIsScrubbing(false);
      clearLastScrolledItem();
      movedDuringScrubRef.current = false;
    },
    [clearLastScrolledItem]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsScrubbing(true);
      movedDuringScrubRef.current = false;
      scrubOriginYRef.current = e.clientY;
      clearLastScrolledItem();

      setActiveIndex(resolveIndexFromClientY(e.clientY));
    },
    [clearLastScrolledItem, resolveIndexFromClientY, setActiveIndex]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

      if (Math.abs(e.clientY - scrubOriginYRef.current) > SCRUB_MOVE_THRESHOLD) {
        movedDuringScrubRef.current = true;
      }

      if (movedDuringScrubRef.current) {
        selectFromClientY(e.clientY, 'auto');
      }
    },
    [selectFromClientY]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();

      if (!movedDuringScrubRef.current) {
        selectAtIndex(resolveIndexFromClientY(e.clientY), 'smooth');
      }
      endScrub(e);
    },
    [endScrub, resolveIndexFromClientY, selectAtIndex]
  );

  if (anchors.length < 2) return null;

  const activeLabel = anchors[activeIndex]?.label ?? '';

  return (
    <div
      className="pointer-events-none absolute left-full top-0 hidden h-full w-0 gallery-rail:block"
      aria-hidden
    >
      <nav
        ref={navRef}
        aria-label="날짜별 탐색"
        style={{ marginLeft: GALLERY_RAIL_SIDE_MARGIN_PX }}
        className="pointer-events-auto sticky top-[140px] pt-20 z-20 w-max self-start cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={stopGalleryClickPropagation}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={anchors.length - 1}
        aria-valuenow={activeIndex}
        aria-valuetext={activeLabel}
      >
        <div className="flex flex-col-reverse items-center py-3">
          {anchors.flatMap((anchor, index) => {
            const isActive = index === activeIndex;
            const mark = (
              <div
                key={`${anchor.itemId}-${index}`}
                data-rail-index={index}
                className={`${GALLERY_SLIDER_MARK_BOX_RAIL} ${
                  isActive ? GALLERY_SLIDER_MARK_ACTIVE_CLASS : GALLERY_SLIDER_MARK_INACTIVE_CLASS
                }`}
                aria-hidden={isActive}
              >
                {anchor.label}
              </div>
            );

            if (index === anchors.length - 1) return [mark];

            return [
              mark,
              <span
                key={`rail-seg-${index}`}
                className="pointer-events-none flex h-8 shrink-0 items-center justify-center self-center"
                aria-hidden
              >
                <span className="h-[60%] w-0 border-l border-dashed border-gray-400 md:border-l-[1.3px]" />
              </span>,
            ];
          })}
        </div>
      </nav>
    </div>
  );
}

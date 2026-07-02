'use client';

import {
  Suspense,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GalleryItem as GalleryItemType } from './types';
import { GalleryModal } from './GalleryModal';
import { GalleryItem, GallerySkeletonCard } from './GalleryItem';
import { buildGalleryPath, findGalleryItemBySlug, GALLERY_BASE_PATH } from './gallerySlug';
import { getSortableDate } from './helpers';
import { preloadGalleryModalImages } from '@/lib/preloadImages';

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
function useGalleryLayout(markOverride?: number | null, enabled = true): GalleryLayout {
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

function buildGallerySliderMarks(
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
const SCROLL_SYNC_SETTLE_FALLBACK_MS = 600;

interface GalleryYearIndexProps {
  anchors: GalleryDateAnchor[];
  thumbLayout: SliderThumbLayout;
  onSelectSliderMark: (
    itemId: string,
    behavior?: ScrollBehavior,
    options?: { scrollToGalleryTop?: boolean }
  ) => void;
  getItemElement: (itemId: string) => HTMLElement | null;
}

function stopGalleryClickPropagation(e: React.MouseEvent) {
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
): React.CSSProperties {
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
  const [thumbTransitionEnabled, setThumbTransitionEnabled] = useState(false);
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
    if (anchorCount < 2) {
      setThumbTransitionEnabled(false);
      return;
    }

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
    setThumbTransitionEnabled(true);
  }, [anchorCount, clampDefaultIndex]);

  const pauseScrollSyncUntilSettled = useCallback(() => {
    scrollSettleCleanupRef.current?.();

    isScrollSyncPausedRef.current = true;
    let settled = false;

    const resume = () => {
      if (settled) return;
      settled = true;
      isScrollSyncPausedRef.current = false;
      scrollSettleCleanupRef.current = null;
      window.clearTimeout(fallback);
      window.removeEventListener('scrollend', onScrollEnd);
    };

    const onScrollEnd = () => resume();
    const fallback = window.setTimeout(resume, SCROLL_SYNC_SETTLE_FALLBACK_MS);

    window.addEventListener('scrollend', onScrollEnd, { once: true });
    scrollSettleCleanupRef.current = resume;
  }, []);

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

  return [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled, thumbTransitionEnabled] as const;
}

function useGalleryStickyScrollY(navRef?: RefObject<HTMLElement | null>) {
  return useCallback(() => {
    const nav = navRef?.current ?? document.querySelector<HTMLElement>('[data-gallery-year-nav]');
    return getGalleryYearNavStickyScrollY(nav);
  }, [navRef]);
}

function useSelectSliderMarkAtIndex(
  anchors: GalleryDateAnchor[],
  onSelectSliderMark: GalleryYearIndexProps['onSelectSliderMark'],
  setActiveIndex: (index: number) => void,
  pauseScrollSyncUntilSettled: () => void
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
      pauseScrollSyncUntilSettled();
      const isNewestMark = clamped === anchors.length - 1;
      onSelectSliderMark(itemId, behavior, isNewestMark ? { scrollToGalleryTop: true } : undefined);
    },
    [anchors, onSelectSliderMark, pauseScrollSyncUntilSettled, setActiveIndex]
  );

  const clearLastScrolledItem = useCallback(() => {
    lastScrolledItemIdRef.current = null;
  }, []);

  return { selectAtIndex, clearLastScrolledItem };
}

/** 1600px 이하 — 상단 sticky 가로형 날짜 슬라이더 */
function GalleryYearIndexFloating({
  anchors,
  thumbLayout,
  onSelectSliderMark,
  getItemElement,
}: GalleryYearIndexProps) {
  const navRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const getStickyScrollY = useGalleryStickyScrollY(navRef);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled, thumbTransitionEnabled] =
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
    pauseScrollSyncUntilSettled
  );
  const thumbRatio = thumbRatioFromIndex(activeIndex, anchors.length);
  const movedDuringScrubRef = useRef(false);
  const scrubOriginXRef = useRef(0);

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

      if (Math.abs(e.clientX - scrubOriginXRef.current) > SCRUB_MOVE_THRESHOLD) {
        movedDuringScrubRef.current = true;
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
      <nav
        ref={navRef}
        aria-label="날짜별 탐색"
        data-gallery-year-nav
        className="gallery-rail:hidden sticky top-[var(--header-height,76px)] z-20 -mx-4 mb-2 bg-white/95 px-4 py-1.5 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 sm:py-2 md:-mx-6 md:mb-3 md:px-6 md:py-3"
      >
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
              if (index === activeIndex) return null;

              const ratio = thumbRatioFromIndex(index, anchors.length);
              return (
                <span
                  key={`${anchor.itemId}-${index}`}
                  className="pointer-events-none absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 text-xs font-medium tabular-nums text-gray-500 md:text-sm"
                  style={{ left: thumbLeftCss(ratio, thumbLayout) }}
                >
                  {anchor.label}
                </span>
              );
            })}

            <div
              className={`absolute top-0.5 bottom-0.5 z-10 flex min-w-[2.5rem] items-center justify-center rounded bg-brand-primary px-1.5 text-xs font-semibold text-white tabular-nums shadow-sm pointer-events-none sm:top-1 sm:bottom-1 md:top-0.5 md:bottom-0.5 xl:top-1 xl:bottom-1 md:min-w-[3.5rem] md:rounded-md md:px-2.5 md:text-sm ${
                isScrubbing || !thumbTransitionEnabled ? '' : 'transition-[left] duration-150 ease-out'
              }`}
              style={{
                left: thumbLeftCss(thumbRatio, thumbLayout),
                transform: 'translateX(-50%)',
              }}
              aria-hidden
            >
              {activeLabel}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

/** 1601px 이상 — 그리드 오른쪽 세로형 날짜 슬라이더 */
function GalleryYearIndexRail({
  anchors,
  onSelectSliderMark,
  getItemElement,
}: Omit<GalleryYearIndexProps, 'thumbLayout'>) {
  const navRef = useRef<HTMLElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const getStickyScrollY = useGalleryStickyScrollY();
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled, thumbTransitionEnabled] =
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
    pauseScrollSyncUntilSettled
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
        className="pointer-events-auto sticky top-[var(--header-height,76px)] pt-8 z-20 w-max self-start cursor-pointer touch-none select-none"
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
        <div className="flex flex-col-reverse items-center gap-6 py-3">
          {anchors.map((anchor, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={`${anchor.itemId}-${index}`}
                data-rail-index={index}
                className={`flex min-w-[4.75rem] items-center justify-center rounded-md px-2.5 py-1 text-sm tabular-nums pointer-events-none ${
                  isActive
                    ? `bg-brand-primary font-semibold text-white shadow-sm ${
                        isScrubbing || !thumbTransitionEnabled ? '' : 'transition-all duration-150 ease-out'
                      }`
                    : 'font-medium text-gray-500'
                }`}
                aria-hidden={isActive}
              >
                {anchor.label}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ─── Gallery grid ────────────────────────────────────────────────────────────

const SCROLL_WAIT_FALLBACK_MS = 600;

interface GalleryGridProps {
  items: GalleryItemType[];
  selectedItem?: GalleryItemType | null;
  className?: string;
  count?: number | null;
  /** true: slug URL + detail param (gallery page). false: modal only, no router (home embed) */
  syncUrl?: boolean;
  /** 날짜 슬라이더 눈금 수 — 가로형·세로형 공통 (미지정 시 md 미만 6, xl 미만 8, xl 이상 10) */
  sliderMarkCount?: number;
}

function GalleryGridLocal({
  items,
  className = '',
  count = null,
}: GalleryGridProps) {
  const visibleItems = count != null ? items.slice(0, count) : items;
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const [imageIndexByItemId, setImageIndexByItemId] = useState<Record<string, number>>({});

  const handleItemImageIndexChange = useCallback((itemId: string, index: number) => {
    setImageIndexByItemId((prev) => (prev[itemId] === index ? prev : { ...prev, [itemId]: index }));
  }, []);

  const closeDetailModal = useCallback(() => {
    document.body.style.overflow = 'auto';
    setLocalModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleCardClick = useCallback(
    (item: GalleryItemType) => {
    setSelectedItem(item);
    setLocalModalOpen(true);
    const imageIndex = imageIndexByItemId[item.id] ?? 0;
    void preloadGalleryModalImages(item.images, imageIndex);
    },
    [imageIndexByItemId]
  );

  return (
    <>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 text-left ${className}`}
      >
        {visibleItems.map((item) => (
          <GalleryItem
            key={item.id}
            item={item}
            onCardClick={handleCardClick}
            imageIndex={imageIndexByItemId[item.id] ?? 0}
            onImageIndexChange={(index) => handleItemImageIndexChange(item.id, index)}
          />
        ))}
      </div>

      {localModalOpen && selectedItem && (
        <GalleryModal
          key={selectedItem.id}
          item={selectedItem}
          initialImageIndex={imageIndexByItemId[selectedItem.id] ?? 0}
          onImageIndexChange={(index) => handleItemImageIndexChange(selectedItem.id, index)}
          onClose={closeDetailModal}
        />
      )}
    </>
  );
}

// selectedItem                   : 선택항목 A. 클릭하자마자 B로 바뀜
// pendingItem                    : 클릭 slug B. router가 따라잡기 전까지 유지, activeSlug === B 되면 null
// replaceState()                 : Router.replace 응답 받기 전, 주소창을 B로 바꿈
// usePathname() + activeSlug     : Next.js 클라이언트 라우터가 “이미 반영했다”고 보는 pathname.
//                                  Router.replace 응답 받기 전, 선택항목 A
//                                  Router.replace 응답 받은 후, 클릭항목 B
//
// selected = 지금 UI에 쓰는 선택(B로 즉시 변경)
// pending  = “URL이 아직 A인 동안 B를 지켜라” → replaceState로 주소창만 앞서게 함 → activeSlug가 B가 되면 null
// open     = router.replace 응답이 빠르거나 scroll 완료/timeout인 경우 모달 오픈
//
// // ─────────────────────────────────────────────────────────────────────────
// 다른 카드 선택
//   + 즉시 주소창 변경 (replaceState())
//   + 즉시 router.replace 요청 (주소창이 변경되는 건 아니기 때문에 replaceState가 필요)
//   + 즉시 photo 전체 preload
//   + 즉시 클릭 항목으로 스크롤 (scrollToItemThen → element.scrollIntoView({ behavior: 'smooth', block: 'center' }))
//   + 이전 URL 반영을 방어 (isUrlStale)
//   ※ 날짜 슬라이더 눈금 클릭은 별도 경로 — scrollToItem (focal line 기준 window.scrollTo)
//
// 모달 오픈 (isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed) =
//   scroll 완료 (scrollend 또는 600ms)
//     → detailPending=true → 모달 바로 오픈 (router.replace 응답/preloading 상관없이, “방금 클릭해서 모달 열어야 함”)
//   OR router가 scroll보다 먼저 완료 (urlDetailOpen=true)
//
// 모달 닫기 (!(urlDetailOpen || detailPending) 또는 detailSuppressed === true) =
//   router가 detail=1을 주지 않고(urlDetailOpen) detailPending이 false인 경우
//   OR 사용자가 직접 모달을 닫아서 (detailSuppressed = true)가 되는 경우
// // ─────────────────────────────────────────────────────────────────────────

function GalleryGridSynced({
  items,
  className = '',
  count = null,
  sliderMarkCount,
}: GalleryGridProps) {
  const visibleItems = count != null ? items.slice(0, count) : items;
  const [layoutReady, setLayoutReady] = useState(false);
  useLayoutEffect(() => setLayoutReady(true), []);

  const { sliderMarkCount: resolvedSliderMarkCount, labelFormat, thumbLayout } = useGalleryLayout(
    sliderMarkCount,
    layoutReady
  );
  const dateAnchors = useMemo(() => {
    if (!layoutReady) return [];
    return buildGallerySliderMarks(visibleItems, resolvedSliderMarkCount, labelFormat);
  }, [visibleItems, resolvedSliderMarkCount, labelFormat, layoutReady]);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlDetailOpen = searchParams.get('detail') === '1';
  const [detailPending, setDetailPending] = useState(false);
  const [detailSuppressed, setDetailSuppressed] = useState(false);
  const isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed;

  const modalOpenGenerationRef = useRef(0);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const [imageIndexByItemId, setImageIndexByItemId] = useState<Record<string, number>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastScrolledIdRef = useRef<string | null>(null);

  const getGalleryItemElement = useCallback(
    (itemId: string) => itemRefs.current[itemId] ?? null,
    []
  );

  const handleItemImageIndexChange = useCallback((itemId: string, index: number) => {
    setImageIndexByItemId((prev) => (prev[itemId] === index ? prev : { ...prev, [itemId]: index }));
  }, []);

  const activeSlug = useMemo(() => {
    const prefix = `${GALLERY_BASE_PATH}/`;
    if (!pathname.startsWith(prefix) || pathname.length <= prefix.length) return null;
    return pathname.slice(prefix.length).replace(/\/$/, '') || null;
  }, [pathname]);

  const isUrlStale = pendingItem != null && activeSlug !== pendingItem;

  useEffect(() => {
    if (urlDetailOpen) {
      setDetailSuppressed(false);
      setDetailPending(false);
    }
  }, [urlDetailOpen]);

  const cancelPendingOpen = useCallback(() => {
    modalOpenGenerationRef.current += 1;
    setDetailPending(false);
    setPendingItem(null);
  }, []);

  /** 가로형·세로형 슬라이더 날짜 눈금 클릭 시 스크롤.
   *  scrollToGalleryTop=true(최신 눈금) → 갤러리 sticky 상단, 그 외 → focal line.
   *  1601px+(세로형)일 때 verticalSliderScrollOffsetPx(70px)만큼 위로 보정. */
  const scrollToItem = useCallback(
    (
      itemId: string,
      behavior: ScrollBehavior = 'smooth',
      options?: { scrollToGalleryTop?: boolean }
    ) => {
      lastScrolledIdRef.current = itemId;
      const verticalSliderScrollOffsetPx = window.matchMedia('(min-width: 1601px)').matches ? 70 : 0;

      if (options?.scrollToGalleryTop) {
        const nav = document.querySelector<HTMLElement>('[data-gallery-year-nav]');
        window.scrollTo({
          top: Math.max(0, getGalleryYearNavStickyScrollY(nav) - verticalSliderScrollOffsetPx),
          behavior,
        });
        return;
      }

      const el = itemRefs.current[itemId];
      if (!el) return;
      window.scrollTo({
        top: Math.max(0, getFocalAlignedScrollY(el) - verticalSliderScrollOffsetPx),
        behavior,
      });
    },
    []
  );

  const scrollToItemThen = useCallback((itemId: string, generation: number, onDone: () => void) => {
    lastScrolledIdRef.current = itemId;
    const element = itemRefs.current[itemId];

    const finish = () => {
      if (modalOpenGenerationRef.current !== generation) return;
      onDone();
    };

    if (!element) {
      finish();
      return;
    }

    let settled = false;
    const complete = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallback);
      window.removeEventListener('scrollend', onScrollEnd);
      finish();
    };

    const onScrollEnd = () => complete();
    const fallback = window.setTimeout(complete, SCROLL_WAIT_FALLBACK_MS);

    window.addEventListener('scrollend', onScrollEnd, { once: true });
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (!pendingItem || activeSlug !== pendingItem) return;
    setPendingItem(null);
  }, [activeSlug, pendingItem]);

  useEffect(() => {
    if (detailPending || isUrlStale) return;

    if (!activeSlug) {
      if (!urlDetailOpen) setSelectedItem(null);
      return;
    }
    const match = findGalleryItemBySlug(items, activeSlug);
    if (match) setSelectedItem(match);
  }, [activeSlug, items, urlDetailOpen, detailPending, isUrlStale]);

  useEffect(() => {
    if (pendingItem) return;
    if (!activeSlug) lastScrolledIdRef.current = null;
  }, [activeSlug, pendingItem]);

  useEffect(() => {
    if (detailPending || pendingItem) return;
    if (!selectedItem || activeSlug !== selectedItem.slug) return;
    if (lastScrolledIdRef.current === selectedItem.id) return;

    scrollToItem(selectedItem.id);
  }, [selectedItem, activeSlug, detailPending, pendingItem, scrollToItem]);

  const closeDetailModal = useCallback(() => {
    cancelPendingOpen();
    document.body.style.overflow = 'auto';
    setDetailSuppressed(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('detail');
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', nextUrl);
    router.replace(nextUrl, { scroll: false });
  }, [router, pathname, searchParams, cancelPendingOpen]);

  const handleCardClick = useCallback(
    (item: GalleryItemType) => {
      const generation = ++modalOpenGenerationRef.current;
      setSelectedItem(item);
      setPendingItem(item.slug);
      setDetailSuppressed(false);
      setDetailPending(false);

      const imageIndex = imageIndexByItemId[item.id] ?? 0;
      void preloadGalleryModalImages(item.images, imageIndex);

      const url = buildGalleryPath(item.slug, { detail: true });
      window.history.replaceState(null, '', url);
      router.replace(url, { scroll: false });

      scrollToItemThen(item.id, generation, () => setDetailPending(true));
    },
    [router, imageIndexByItemId, scrollToItemThen]
  );

  const modalItem = isDetailOpen ? selectedItem : null;
  const dateSliderReady = layoutReady && dateAnchors.length >= 2;

  return (
    <>
      {dateSliderReady && (
      <GalleryYearIndexFloating
        anchors={dateAnchors}
          thumbLayout={thumbLayout}
          onSelectSliderMark={scrollToItem}
        getItemElement={getGalleryItemElement}
      />
      )}

      <div className="mb-2 md:mb-4" data-gallery-total>
        <p className="text-gray-600 text-base md:text-lg">
          Total{' '}
          <span className="font-semibold text-gray-900">{visibleItems.length}</span> items
        </p>
      </div>

      <div className="relative overflow-visible" data-gallery-grid-wrap>
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 text-left ${className}`}
        >
          {visibleItems.map((item) => (
            <GalleryItem
              key={item.id}
              item={item}
              onCardClick={handleCardClick}
              imageIndex={imageIndexByItemId[item.id] ?? 0}
              onImageIndexChange={(index) => handleItemImageIndexChange(item.id, index)}
              setItemRef={(el) => {
                itemRefs.current[item.id] = el;
              }}
            />
          ))}
        </div>

        {dateSliderReady && (
        <GalleryYearIndexRail
          anchors={dateAnchors}
            onSelectSliderMark={scrollToItem}
          getItemElement={getGalleryItemElement}
        />
        )}
      </div>

      {modalItem && (
        <GalleryModal
          key={modalItem.id}
          item={modalItem}
          initialImageIndex={imageIndexByItemId[modalItem.id] ?? 0}
          onImageIndexChange={(index) => handleItemImageIndexChange(modalItem.id, index)}
          onClose={closeDetailModal}
        />
      )}
    </>
  );
}

function GalleryGridSyncedWithSuspense(props: GalleryGridProps) {
  const visibleCount = props.count ?? props.items.length;
  const fallback = (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 text-left ${props.className ?? ''}`}
      aria-hidden
    >
      {Array.from({ length: visibleCount }, (_, i) => (
        <GallerySkeletonCard key={i} />
      ))}
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <GalleryGridSynced {...props} />
    </Suspense>
  );
}

export function GalleryGrid({ syncUrl = true, ...props }: GalleryGridProps) {
  if (!syncUrl) {
    return <GalleryGridLocal {...props} syncUrl={false} />;
  }
  return <GalleryGridSyncedWithSuspense {...props} syncUrl />;
}

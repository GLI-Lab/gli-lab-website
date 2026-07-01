'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import {
  getGalleryYearNavStickyScrollY,
  resolveActiveSnapIndexFromAnchors,
  type GalleryDateAnchor,
} from './helpers';

function stopGalleryClickPropagation(e: React.MouseEvent) {
  e.stopPropagation();
}

/** 1600px 이하: 상단 슬라이더, 1601px 이상: 오른쪽 레일 */
const GALLERY_RAIL_SIDE_MARGIN_PX = 12;

const SCRUB_MOVE_THRESHOLD = 4;
const SLIDER_MD_MIN_WIDTH_QUERY = '(min-width: 768px)';
const SCROLL_SYNC_SETTLE_FALLBACK_MS = 600;

interface GalleryYearIndexProps {
  anchors: GalleryDateAnchor[];
  onSelectSnap: (
    itemId: string,
    behavior?: ScrollBehavior,
    options?: { scrollToSticky?: boolean }
  ) => void;
  getItemElement: (itemId: string) => HTMLElement | null;
}

interface SliderThumbLayout {
  sidePadRem: number;
  thumbHalfRem: number;
  thumbWidthRem: number;
}

const SLIDER_THUMB_SIDE_PAD_MD_UP_REM = 1;
const SLIDER_THUMB_SIDE_PAD_BELOW_MD_REM = 0.5;

function useSliderThumbLayout(): SliderThumbLayout {
  // SSR과 첫 클라이언트 렌더를 맞춤 — mount 후 useEffect에서 실제 breakpoint 반영
  const [isMdUp, setIsMdUp] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(SLIDER_MD_MIN_WIDTH_QUERY);
    const update = () => setIsMdUp(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return {
    sidePadRem: isMdUp ? SLIDER_THUMB_SIDE_PAD_MD_UP_REM : SLIDER_THUMB_SIDE_PAD_BELOW_MD_REM,
    thumbHalfRem: isMdUp ? 1.75 : 1.25,
    thumbWidthRem: isMdUp ? 3.5 : 2.5,
  };
}

function thumbLeftCss(ratio: number, layout: SliderThumbLayout) {
  const { sidePadRem, thumbHalfRem, thumbWidthRem } = layout;
  return `calc(${sidePadRem}rem + ${thumbHalfRem}rem + (100% - ${sidePadRem * 2}rem - ${thumbWidthRem}rem) * ${ratio})`;
}

function useGalleryItemScrollActiveIndex(
  anchors: GalleryDateAnchor[],
  getItemElement: (itemId: string) => HTMLElement | null,
  isScrubbing: boolean,
  defaultIndex: number,
  getStickyScrollY?: () => number | null
) {
  const anchorCount = anchors.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    anchorCount < 2 ? 0 : Math.max(0, Math.min(defaultIndex, anchorCount - 1))
  );
  const isScrubbingRef = useRef(isScrubbing);
  const isScrollSyncPausedRef = useRef(false);
  const scrollSettleCleanupRef = useRef<(() => void) | null>(null);
  const getItemElementRef = useRef(getItemElement);
  const anchorsRef = useRef(anchors);

  useEffect(() => {
    getItemElementRef.current = getItemElement;
  }, [getItemElement]);

  useEffect(() => {
    anchorsRef.current = anchors;
  }, [anchors]);

  useEffect(() => {
    isScrubbingRef.current = isScrubbing;
  }, [isScrubbing]);

  const getStickyScrollYRef = useRef(getStickyScrollY);

  useEffect(() => {
    getStickyScrollYRef.current = getStickyScrollY;
  }, [getStickyScrollY]);

  const syncFromScroll = useCallback(() => {
    if (anchorCount < 2 || isScrubbingRef.current || isScrollSyncPausedRef.current) return;

    const next = resolveActiveSnapIndexFromAnchors(
      anchorsRef.current,
      getItemElementRef.current,
      {
        defaultIndex,
        stickyScrollY: getStickyScrollYRef.current?.() ?? null,
      }
    );
    if (next === null || !Number.isFinite(next)) return;

    const clamped = Math.max(0, Math.min(next, anchorCount - 1));
    setActiveIndex((prev) => (prev === clamped ? prev : clamped));
  }, [anchorCount, defaultIndex]);

  // 클릭 이동 동안 sync 일시정지 → 이동이 끝나면 재-sync 없이 그대로 unpause.
  // (클릭한 snap을 유지하고, 프로그램 스크롤로 인한 슬라이더 덮어쓰기를 방지)
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

  useEffect(() => {
    return () => {
      scrollSettleCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (anchorCount < 2) {
      setActiveIndex(0);
      return;
    }

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

function useSelectSnapAtIndex(
  anchors: GalleryDateAnchor[],
  onSelectSnap: GalleryYearIndexProps['onSelectSnap'],
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
      const isNewestSnap = clamped === anchors.length - 1;
      onSelectSnap(itemId, behavior, isNewestSnap ? { scrollToSticky: true } : undefined);
    },
    [anchors, onSelectSnap, pauseScrollSyncUntilSettled, setActiveIndex]
  );

  const clearLastScrolledItem = useCallback(() => {
    lastScrolledItemIdRef.current = null;
  }, []);

  return { selectAtIndex, clearLastScrolledItem };
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

function thumbGapSegmentStyle(leftIndex: number, count: number, layout: SliderThumbLayout): React.CSSProperties {
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

/** 1600px 이하: 상단 sticky 슬라이더 (왼쪽=과거, 오른쪽=최신, md 미만 YY.MM / md 이상 YYYY.MM) */
export function GalleryYearIndexFloating({
  anchors,
  onSelectSnap,
  getItemElement,
}: GalleryYearIndexProps) {
  const thumbLayout = useSliderThumbLayout();
  const navRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const getStickyScrollY = useGalleryStickyScrollY(navRef);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled] = useGalleryItemScrollActiveIndex(
    anchors,
    getItemElement,
    isScrubbing,
    anchors.length - 1,
    getStickyScrollY
  );
  const { selectAtIndex, clearLastScrolledItem } = useSelectSnapAtIndex(
    anchors,
    onSelectSnap,
    setActiveIndex,
    pauseScrollSyncUntilSettled
  );
  const thumbRatio = thumbRatioFromIndex(activeIndex, anchors.length);
  const movedDuringScrubRef = useRef(false);
  const scrubOriginXRef = useRef(0);

  const resolveThumbRatioFromClientX = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || anchors.length === 0) return 0;
      if (anchors.length === 1) return 0;

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
    (clientX: number): number => {
      return indexFromThumbRatio(resolveThumbRatioFromClientX(clientX), anchors.length);
    },
    [anchors.length, resolveThumbRatioFromClientX]
  );

  const selectFromClientX = useCallback(
    (clientX: number, behavior: ScrollBehavior) => {
      selectAtIndex(resolveIndexFromClientX(clientX), behavior);
    },
    [resolveIndexFromClientX, selectAtIndex]
  );

  const endScrub = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsScrubbing(false);
    clearLastScrolledItem();
    movedDuringScrubRef.current = false;
  }, [clearLastScrolledItem]);

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
              isScrubbing ? '' : 'transition-[left] duration-150 ease-out'
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

/** 1601px 이상: 그리드 오른쪽 세로 스크러버 (floating과 동일 snap·동기화) */
export function GalleryYearIndexRail({
  anchors,
  onSelectSnap,
  getItemElement,
}: GalleryYearIndexProps) {
  const navRef = useRef<HTMLElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const getStickyScrollY = useGalleryStickyScrollY();
  const [activeIndex, setActiveIndex, pauseScrollSyncUntilSettled] = useGalleryItemScrollActiveIndex(
    anchors,
    getItemElement,
    isScrubbing,
    anchors.length - 1,
    getStickyScrollY
  );
  const { selectAtIndex, clearLastScrolledItem } = useSelectSnapAtIndex(
    anchors,
    onSelectSnap,
    setActiveIndex,
    pauseScrollSyncUntilSettled
  );
  const movedDuringScrubRef = useRef(false);
  const scrubOriginYRef = useRef(0);

  const resolveIndexFromClientY = useCallback(
    (clientY: number): number => {
      const nav = navRef.current;
      if (!nav || anchors.length === 0) return 0;

      const snaps = nav.querySelectorAll<HTMLElement>('[data-rail-index]');
      if (snaps.length === 0) return 0;

      let closestIndex = 0;
      let closestDistance = Infinity;

      snaps.forEach((snap, index) => {
        const rect = snap.getBoundingClientRect();
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

  const endScrub = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsScrubbing(false);
    clearLastScrolledItem();
    movedDuringScrubRef.current = false;
  }, [clearLastScrolledItem]);

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
                          isScrubbing ? '' : 'transition-all duration-150 ease-out'
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

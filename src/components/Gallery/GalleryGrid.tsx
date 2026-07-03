'use client';

import {
  Suspense,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GalleryItem as GalleryItemType } from './types';
import { GalleryModal } from './GalleryModal';
import { GalleryItem, GallerySkeletonCard } from './GalleryItem';
import { buildGalleryPath, findGalleryItemBySlug, GALLERY_BASE_PATH } from './gallerySlug';
import { preloadGalleryModalImages } from '@/lib/preloadImages';
import {
  useGalleryLayout,
  buildGallerySliderMarks,
  resolveGalleryScrollTargetY,
  scrollToY,
  GalleryDateSliderFloating,
  GalleryDateSliderRail,
} from './GalleryDateSlider';

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

  const getScrollTargetY = useCallback(
    (itemId: string, options?: { scrollToGalleryTop?: boolean }) =>
      resolveGalleryScrollTargetY(itemId, getGalleryItemElement, options),
    [getGalleryItemElement]
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
      const targetY = resolveGalleryScrollTargetY(
        itemId,
        (id) => itemRefs.current[id] ?? null,
        options
      );
      if (targetY == null) return;
      scrollToY(targetY, behavior);
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
      <GalleryDateSliderFloating
        anchors={dateAnchors}
          thumbLayout={thumbLayout}
          onSelectSliderMark={scrollToItem}
        getItemElement={getGalleryItemElement}
        getScrollTargetY={getScrollTargetY}
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
        <GalleryDateSliderRail
          anchors={dateAnchors}
            onSelectSliderMark={scrollToItem}
          getItemElement={getGalleryItemElement}
          getScrollTargetY={getScrollTargetY}
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

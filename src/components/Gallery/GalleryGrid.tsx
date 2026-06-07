'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GalleryItem as GalleryItemType } from './types';
import { GalleryModal } from './GalleryModal';
import { GalleryItem } from './GalleryItem';
import { buildGalleryPath, findGalleryItemBySlug, GALLERY_BASE_PATH } from './gallerySlug';
import { preloadGalleryModalImages } from '@/lib/preloadImages';

/** scrollend 미지원·이미 뷰포트 내일 때 너무 빠르게 scroll이 완료되니깐 대기 */
const SCROLL_WAIT_FALLBACK_MS = 600;

interface GalleryGridProps {
  items: GalleryItemType[];
  selectedItem?: GalleryItemType | null;
  className?: string;
  count?: number | null;
  /** true: slug URL + detail param (gallery page). false: modal only, no router (home embed) */
  syncUrl?: boolean;
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

  const handleCardClick = useCallback((item: GalleryItemType) => {
    setSelectedItem(item);
    setLocalModalOpen(true);
    const imageIndex = imageIndexByItemId[item.id] ?? 0;
    void preloadGalleryModalImages(item.images, imageIndex);
  }, [imageIndexByItemId]);

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 text-left ${className}`}>
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

function GalleryGridSynced({
  items,
  className = '',
  count = null,
}: GalleryGridProps) {
  const visibleItems = count != null ? items.slice(0, count) : items;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlDetailOpen = searchParams.get('detail') === '1';
  const [detailPending, setDetailPending] = useState(false);
  const [detailSuppressed, setDetailSuppressed] = useState(false);
  const isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed;

  const modalOpenGenerationRef = useRef(0);
  /** 클릭 직후 pathname(activeSlug)이 따라잡기 전까지 이전 URL slug 무시 */
  const [pendingItemSlug, setPendingItemSlug] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const [imageIndexByItemId, setImageIndexByItemId] = useState<Record<string, number>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastScrolledIdRef = useRef<string | null>(null);

  const handleItemImageIndexChange = useCallback((itemId: string, index: number) => {
    setImageIndexByItemId((prev) => (prev[itemId] === index ? prev : { ...prev, [itemId]: index }));
  }, []);

  const activeSlug = useMemo(() => {
    const prefix = `${GALLERY_BASE_PATH}/`;
    if (!pathname.startsWith(prefix) || pathname.length <= prefix.length) return null;
    return pathname.slice(prefix.length).replace(/\/$/, '') || null;
  }, [pathname]);

  const isUrlStale = pendingItemSlug != null && activeSlug !== pendingItemSlug;

  useEffect(() => {
    if (urlDetailOpen) {
      setDetailSuppressed(false);
      setDetailPending(false);
    }
  }, [urlDetailOpen]);

  const cancelPendingOpen = useCallback(() => {
    modalOpenGenerationRef.current += 1;
    setDetailPending(false);
    setPendingItemSlug(null);
  }, []);

  const scrollToItem = useCallback((itemId: string) => {
    lastScrolledIdRef.current = itemId;
    itemRefs.current[itemId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

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

  // pathname(activeSlug)가 클릭 대상과 일치하면 pending 해제
  useEffect(() => {
    if (!pendingItemSlug || activeSlug !== pendingItemSlug) return;
    setPendingItemSlug(null);
  }, [activeSlug, pendingItemSlug]);

  // layout 유지 시 page가 갱신되지 않아도 URL slug로 selectedItem 동기화
  // detailPending·stale slug 동안: 클릭한 item 유지
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
    if (pendingItemSlug) return;
    if (!activeSlug) lastScrolledIdRef.current = null;
  }, [activeSlug, pendingItemSlug]);

  // 외부 URL 진입·뒤로가기 시 스크롤 (페이지 내 클릭은 handleCardClick에서 처리)
  useEffect(() => {
    if (detailPending || pendingItemSlug) return;
    if (!selectedItem || activeSlug !== selectedItem.slug) return;
    if (lastScrolledIdRef.current === selectedItem.id) return;

    scrollToItem(selectedItem.id);
  }, [selectedItem, activeSlug, detailPending, pendingItemSlug, scrollToItem]);

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
      setPendingItemSlug(item.slug);
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

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 text-left ${className}`}>
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
        <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="aspect-[8/5] bg-gray-200 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
        </div>
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

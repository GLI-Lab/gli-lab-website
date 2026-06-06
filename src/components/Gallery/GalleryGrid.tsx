'use client';

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { GalleryItem as GalleryItemType } from './types';
import { GalleryModal } from './GalleryModal';
import { GalleryItem } from './GalleryItem';
import { buildGalleryPath, findGalleryItemBySlug, GALLERY_BASE_PATH } from './gallerySlug';

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
  }, []);

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

  // URL detail + optimistic state (ProfileCards와 동일 패턴)
  // - detailPending: 클릭 직후 URL·RSC 왕복 전 모달 즉시 열기
  // - detailSuppressed: 닫기 즉시 반영
  const urlDetailOpen = searchParams.get('detail') === '1';
  const [detailPending, setDetailPending] = useState(false);
  const [detailSuppressed, setDetailSuppressed] = useState(false);
  const isDetailOpen = (urlDetailOpen || detailPending) && !detailSuppressed;

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

  useEffect(() => {
    if (urlDetailOpen) {
      setDetailSuppressed(false);
      setDetailPending(false);
    }
  }, [urlDetailOpen]);

  // layout 유지 시 page가 갱신되지 않아도 URL slug로 selectedItem 동기화
  // detailPending 중에는 클릭한 item 유지 (activeSlug가 이전 URL이면 덮어쓰지 않음)
  useEffect(() => {
    if (detailPending) return;

    if (!activeSlug) {
      if (!urlDetailOpen) setSelectedItem(null);
      return;
    }
    const match = findGalleryItemBySlug(items, activeSlug);
    if (match) setSelectedItem(match);
  }, [activeSlug, items, urlDetailOpen, detailPending]);

  useEffect(() => {
    if (!activeSlug) lastScrolledIdRef.current = null;
  }, [activeSlug]);

  // activeSlug와 선택 항목이 일치할 때 스크롤
  // /slug/ 만 있어도 해당 카드로 이동, /slug/?detail=1 이면 같은 위치 + 모달
  // 클릭 직후(detailPending)는 activeSlug가 아직 이전 URL이라 여기서 스크롤하지 않음
  useEffect(() => {
    if (!selectedItem || activeSlug !== selectedItem.slug) return;
    if (lastScrolledIdRef.current === selectedItem.id) return;

    lastScrolledIdRef.current = selectedItem.id;
    const element = itemRefs.current[selectedItem.id];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedItem, activeSlug]);

  const closeDetailModal = useCallback(() => {
    document.body.style.overflow = 'auto';
    setDetailPending(false);
    setDetailSuppressed(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('detail');
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', nextUrl);
    router.replace(nextUrl, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleCardClick = useCallback(
    (item: GalleryItemType) => {
      setSelectedItem(item);
      setDetailSuppressed(false);
      setDetailPending(true);
      router.replace(buildGalleryPath(item.slug, { detail: true }), { scroll: false });
    },
    [router]
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

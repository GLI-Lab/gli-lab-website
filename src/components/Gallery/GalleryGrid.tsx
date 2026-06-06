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
          <GalleryItem key={item.id} item={item} onCardClick={handleCardClick} />
        ))}
      </div>

      {localModalOpen && selectedItem && (
        <GalleryModal item={selectedItem} onClose={closeDetailModal} />
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
  const [detailSuppressed, setDetailSuppressed] = useState(false);
  const isDetailOpen = urlDetailOpen && !detailSuppressed;

  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastScrolledIdRef = useRef<string | null>(null);

  const activeSlug = useMemo(() => {
    const prefix = `${GALLERY_BASE_PATH}/`;
    if (!pathname.startsWith(prefix) || pathname.length <= prefix.length) return null;
    return pathname.slice(prefix.length).replace(/\/$/, '') || null;
  }, [pathname]);

  useEffect(() => {
    if (urlDetailOpen) setDetailSuppressed(false);
  }, [urlDetailOpen]);

  // layout 유지 시 page가 갱신되지 않아도 URL slug로 selectedItem 동기화
  useEffect(() => {
    if (!activeSlug) {
      if (!urlDetailOpen) setSelectedItem(null);
      return;
    }
    const match = findGalleryItemBySlug(items, activeSlug);
    if (match) setSelectedItem(match);
  }, [activeSlug, items, urlDetailOpen]);

  useEffect(() => {
    if (!activeSlug) lastScrolledIdRef.current = null;
  }, [activeSlug]);

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
            setItemRef={(el) => {
              itemRefs.current[item.id] = el;
            }}
          />
        ))}
      </div>

      {modalItem && <GalleryModal item={modalItem} onClose={closeDetailModal} />}
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

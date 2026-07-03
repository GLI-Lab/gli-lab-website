'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GalleryItem as GalleryItemType } from './types';
import { ImageCarousel } from './ImageCarousel';
import { isNewItem, formatDateForDisplay } from './helpers';

interface GalleryItemProps {
  item: GalleryItemType;
  onCardClick: (item: GalleryItemType) => void;
  setItemRef?: (el: HTMLDivElement | null) => void;
  /** GalleryGrid와 모달 간 캐러셀 인덱스 동기화 */
  imageIndex?: number;
  onImageIndexChange?: (index: number) => void;
}

/**
 * 스켈레톤 — 실제 콘텐츠(GalleryItem)와 픽셀 단위로 높이가 같아야 새로고침 시
 * 스크롤 복원이 정확히 착지하고 앵커 위치가 흔들리지 않는다.
 * 이미지: aspect-[8/5] md:aspect-[6.5/5] (실제와 동일)
 * 텍스트: p-3 + 제목(h-6 md:h-7) + mb-1 + 행(h-5) → 실제 text-base/lg + text-sm 높이와 일치
 */
export function GallerySkeletonContent() {
  return (
    <>
      <div className="aspect-[8/5] md:aspect-[6.5/5] bg-gray-200 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </div>

      <div className="p-3">
        <div className="h-6 md:h-7 bg-gray-200 rounded animate-pulse mb-1"></div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </>
  );
}

/** Suspense fallback용 — 실제 카드와 동일한 외곽(border/rounded) + 공용 스켈레톤 */
export function GallerySkeletonCard() {
  return (
    <div className="relative bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <GallerySkeletonContent />
    </div>
  );
}

const GalleryItemComponent = ({
  item,
  onCardClick,
  setItemRef,
  imageIndex = 0,
  onImageIndexChange,
}: GalleryItemProps) => {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const carouselInteractedRef = useRef(false);

  const [isInViewport, setIsInViewport] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const markCarouselInteract = useCallback(() => {
    carouselInteractedRef.current = true;
  }, []);

  const openDetail = useCallback(() => {
    if (carouselInteractedRef.current) {
      carouselInteractedRef.current = false;
      return;
    }
    onCardClick(item);
  }, [item, onCardClick]);

  // 터치: 1탭에 :hover만 적용되고 click은 안 오는 경우가 많음 → pointerUp으로 모달 열기
  const TAP_MOVE_THRESHOLD = 12;
  const tapOriginRef = useRef<{ x: number; y: number } | null>(null);
  const openedFromPointerRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    // 새 터치 제스처 시작 — 이전 캐러셀 조작 플래그 초기화 (버튼 탭 후 사진 탭 등)
    carouselInteractedRef.current = false;
    tapOriginRef.current = { x: e.clientX, y: e.clientY };
    openedFromPointerRef.current = false;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const origin = tapOriginRef.current;
      tapOriginRef.current = null;
      if (!origin) return;
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      if (Math.abs(dx) <= TAP_MOVE_THRESHOLD && Math.abs(dy) <= TAP_MOVE_THRESHOLD) {
        openDetail();
        openedFromPointerRef.current = true;
      }
    },
    [openDetail]
  );

  const handleClick = useCallback(() => {
    if (openedFromPointerRef.current) {
      openedFromPointerRef.current = false;
      return;
    }
    // carouselInteractedRef는 openDetail에서 소비 (드래그 직후 click 1회 무시)
    openDetail();
  }, [openDetail]);

  const showContent = isInViewport;

  return (
    <div
      ref={(el) => {
        itemRef.current = el;
        setItemRef?.(el);
      }}
      className="group/details relative bg-white overflow-hidden scroll-mt-20 cursor-pointer
      rounded-xl border border-gray-200 shadow-sm md:hover:border-brand-primary md:hover:shadow-md transition-all duration-200 touch-manipulation"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      {!showContent && <GallerySkeletonContent />}

      {showContent && (
        <>
          <div className="relative overflow-hidden">
            <ImageCarousel
              images={item.images}
              title={item.title}
              className="relative aspect-[8/5] md:aspect-[6.5/5]"
              imageClassName="object-cover overflow-hidden select-none transform transition-all duration-500 md:hover:scale-105 brightness-85 saturate-60 contrast-90 grayscale-[50%] md:hover:brightness-100 md:hover:saturate-100 md:hover:contrast-100 md:hover:grayscale-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              showNavigation={!isCardHovered}
              showIndicators={!isCardHovered}
              currentIndex={imageIndex}
              onImageChange={onImageIndexChange}
              onUserInteract={markCarouselInteract}
            />
          </div>

          <div
            className="p-3 md:px-4 md:py-3"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <div className="text-[16px] md:text-[17px] font-semibold text-gray-800 truncate mb-1">
              {item.title}
              {isNewItem(item.date) && (
                <span className="ml-1.5 text-xs font-bold text-red-500 inline-flex ">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                    N
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: '100ms' }}>
                    e
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: '200ms' }}>
                    w
                  </span>
                </span>
              )}
            </div>

            {item.date && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{formatDateForDisplay(item.date)}</p>

                {item.description && (
                  <span className="text-sm text-gray-500 group-hover/details:underline group-hover/details:text-interactive-primary transition-all duration-200">
                    See more
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const GalleryItem = React.memo(GalleryItemComponent);

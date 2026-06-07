'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from "embla-carousel-react";
import Fade from 'embla-carousel-fade';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  showNavigation?: boolean;
  showIndicators?: boolean;
  currentIndex?: number;
  onImageChange?: (index: number) => void;
  /** 현재 슬라이드 이미지 로드 시 natural 크기 전달 (중복 fetch 없이 비율 체크용) */
  onImageLoad?: (index: number, naturalWidth: number, naturalHeight: number) => void;
  /** prev/next·인디케이터·드래그 시 호출 (카드 클릭과 구분) */
  onUserInteract?: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  className = "relative h-80 bg-gray-100",
  imageClassName = "object-contain",
  sizes = "100vw",
  showNavigation = true,
  showIndicators = true,
  currentIndex,
  onImageChange,
  onImageLoad,
  onUserInteract,
}) => {
  const startIndex = Math.min(
    Math.max(0, currentIndex ?? 0),
    Math.max(0, images.length - 1)
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30, startIndex },
    [Fade()]
  );
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const naturalSizeByIndexRef = useRef<Record<number, { width: number; height: number }>>({});

  useEffect(() => {
    if (currentIndex !== undefined && emblaApi && currentIndex !== selectedIndex) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [currentIndex, emblaApi, selectedIndex]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    onImageChange?.(index);
  }, [emblaApi, onImageChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const notifyImageLoad = useCallback(
    (index: number, naturalWidth: number, naturalHeight: number) => {
      naturalSizeByIndexRef.current[index] = { width: naturalWidth, height: naturalHeight };
      if (index === selectedIndex) {
        onImageLoad?.(index, naturalWidth, naturalHeight);
      }
    },
    [onImageLoad, selectedIndex]
  );

  useEffect(() => {
    const cached = naturalSizeByIndexRef.current[selectedIndex];
    if (cached) {
      onImageLoad?.(selectedIndex, cached.width, cached.height);
    }
  }, [selectedIndex, onImageLoad]);

  const stopPointerBubble = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const onImageNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUserInteract?.();
    emblaApi?.scrollNext();
  }, [emblaApi, onUserInteract]);

  const onImagePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUserInteract?.();
    emblaApi?.scrollPrev();
  }, [emblaApi, onUserInteract]);

  const goToSlide = useCallback((index: number) => {
    onUserInteract?.();
    emblaApi?.scrollTo(index);
  }, [emblaApi, onUserInteract]);

  const handleIndicatorClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      goToSlide(index);
    },
    [goToSlide]
  );

  const DRAG_THRESHOLD = 10;
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerOriginRef.current = { x: e.clientX, y: e.clientY };
    dragStartedRef.current = false;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerOriginRef.current || dragStartedRef.current) return;
      const dx = e.clientX - pointerOriginRef.current.x;
      const dy = e.clientY - pointerOriginRef.current.y;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        dragStartedRef.current = true;
        onUserInteract?.();
      }
    },
    [onUserInteract]
  );

  const handlePointerUp = useCallback(() => {
    pointerOriginRef.current = null;
  }, []);

  // ------------------------------------------------------------ 프리로딩 관련
  // 특정 인덱스가 우선순위 로딩 대상인지 확인
  const shouldHavePriority = (index: number): boolean => {
    // 현재 선택된 이미지
    if (index === selectedIndex) return true;
    
    const totalImages = images.length;
    
    // 이전 이미지 (루프 고려)
    const prevIndex = selectedIndex === 0 ? totalImages - 1 : selectedIndex - 1;
    if (index === prevIndex) return true;
    
    // 다음 이미지 (루프 고려)
    const nextIndex = selectedIndex === totalImages - 1 ? 0 : selectedIndex + 1;
    if (index === nextIndex) return true;
    
    return false;
  };
  // ------------------------------------------------------------

  return (
    <div className={`${className} group`}>
      <div
        className="overflow-hidden h-full"
        ref={emblaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="flex h-full">
          {images.map((imageSrc, index) => (
            <div className="flex-shrink-0 flex-grow-0 basis-full relative" key={index}>
              <Image
                src={imageSrc}
                alt={`${title} ${index + 1}`}
                fill
                className={imageClassName}
                sizes={sizes}
                draggable={false}
                priority={shouldHavePriority(index)}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  notifyImageLoad(index, img.naturalWidth, img.naturalHeight);
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 이미지 네비게이션 */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={onImagePrev}
            onPointerDown={stopPointerBubble}
            onPointerUp={stopPointerBubble}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all bg-white bg-opacity-50 text-gray-700 p-1.5 rounded-full hover:bg-white hover:bg-opacity-95 hover:text-gray-900 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg backdrop-blur-sm"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onImageNext}
            onPointerDown={stopPointerBubble}
            onPointerUp={stopPointerBubble}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all bg-white bg-opacity-50 text-gray-700 p-1.5 rounded-full hover:bg-white hover:bg-opacity-95 hover:text-gray-900 opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg backdrop-blur-sm"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* 이미지 인디케이터 */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => handleIndicatorClick(e, index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
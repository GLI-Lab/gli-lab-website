'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GalleryItem as GalleryItemType } from './types';
import { ImageCarousel } from './ImageCarousel';
import { isNewItem, formatDateForDisplay } from './helpers';

interface GalleryItemProps {
  item: GalleryItemType;
  onCardClick: (item: GalleryItemType) => void;
  setItemRef?: (el: HTMLDivElement | null) => void;
}

const GalleryItemComponent = ({
  item,
  onCardClick,
  setItemRef,
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

  return (
    <div
      ref={(el) => {
        itemRef.current = el;
        setItemRef?.(el);
      }}
      className="group/details relative bg-white overflow-hidden scroll-mt-20 cursor-pointer
      rounded-xl border border-gray-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 touch-manipulation"
      onClick={openDetail}
    >
      {!isInViewport && (
        <>
          <div className="aspect-[7/5] bg-gray-200 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          </div>

          <div className="p-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </>
      )}

      {isInViewport && (
        <>
          <div className="relative overflow-hidden">
            <ImageCarousel
              images={item.images}
              title={item.title}
              className="relative aspect-[8/5] md:aspect-[6/5]"
              imageClassName="object-cover overflow-hidden select-none transform transition-all duration-500 hover:scale-105 brightness-85 saturate-60 contrast-90 grayscale-[50%] transition-all duration-300 md:hover:brightness-100 md:hover:saturate-100 md:hover:contrast-100 md:hover:grayscale-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              showNavigation={!isCardHovered}
              showIndicators={!isCardHovered}
              onUserInteract={markCarouselInteract}
            />
          </div>

          <div
            className="p-3 md:px-4 md:py-3"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <div className="text-base md:text-lg font-semibold text-gray-800 truncate mb-1">
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

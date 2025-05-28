'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GalleryItem as GalleryItemType } from './types';
import { ImageCarousel } from './ImageCarousel';
import { isNewItem } from './helpers';

interface GalleryItemProps {
  item: GalleryItemType;
  onCardClick: (item: GalleryItemType) => void;
}

const GalleryItemComponent = ({
  item,
  onCardClick
}: GalleryItemProps) => {
  // console.log(`----GalleryItem: ${item.id}`);  // 개별 아이템 렌더링 로그
  
  // 각 아이템이 자체적으로 hover 상태 관리
  const [isCardHovered, setIsCardHovered] = useState(false);

  // 터치 상태 관리 (간단 버전)
  const [touchMoved, setTouchMoved] = useState(false);

  // ------------------------------------------------------------ 프리로딩 관련
  // 뷰포트 진입 상태 관리
  const [isInViewport, setIsInViewport] = useState(false);
  
  // 컴포넌트 ref
  const itemRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 뷰포트 진입 감지
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
        rootMargin: '100px', // 뷰포트에 들어오기 100px 전에 로드 시작
        threshold: 0.1
      }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  // ------------------------------------------------------------

  const handleTouchStart = useCallback(() => {
    setTouchMoved(false);
  }, []);

  const handleTouchMove = useCallback(() => {
    setTouchMoved(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchMoved) {
      onCardClick(item);
    }
  }, [touchMoved, item, onCardClick]);
  
  return (
    <div 
      ref={itemRef}
      className="group/details relative bg-white rounded-lg border border-gray-300 overflow-hidden hover:border-interactive-primary hover:shadow-lg transition-all duration-300 touch-manipulation"
      onClick={() => onCardClick(item)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 뷰포트 진입 전 스켈레톤 UI */}
      {!isInViewport && (
        <>
          {/* 썸네일 스켈레톤 */}
          <div className="aspect-[7/6] bg-gray-200 animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          </div>
          
          {/* 카드 정보 스켈레톤 */}
          <div className="p-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </>
      )}
      
      {/* 실제 콘텐츠 */}
      {isInViewport && (
        <>
          {/* 썸네일 이미지 - ImageCarousel */}
          <div className="cursor-grab relative">
            <ImageCarousel
              images={item.images}
              title={item.title}
              className="relative aspect-[7/6] overflow-hidden select-none"
              imageClassName="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              showNavigation={!isCardHovered}
              showIndicators={!isCardHovered}
            />
          </div>

          {/* 카드 정보 - 호버 시 손모양 커서 */}
          <div 
            className="p-3 cursor-pointer"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <div className="font-semibold text-gray-900 mb-1 text-lg truncate">
              {item.title}
              {isNewItem(item.date) && (
                <span className="ml-1 text-xs font-bold text-red-500 inline-flex ">
                  <span className="animate-bounce" style={{animationDelay: '0ms'}}>N</span>
                  <span className="animate-bounce" style={{animationDelay: '100ms'}}>e</span>
                  <span className="animate-bounce" style={{animationDelay: '200ms'}}>w</span>
                </span>
              )}
            </div>
            
            {item.date && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('ko-KR')}
                </p>
                
                {/* See more 버튼 */}
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

// React.memo로 메모이제이션
export const GalleryItem = React.memo(GalleryItemComponent); 
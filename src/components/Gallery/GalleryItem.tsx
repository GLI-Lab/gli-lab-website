'use client';

import React, { useState, useCallback } from 'react';
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
      className="group relative bg-white rounded-lg border border-gray-300 overflow-hidden hover:border-interactive-primary hover:shadow-lg transition-all duration-300 touch-manipulation"
      onClick={() => onCardClick(item)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 썸네일 이미지 - ImageCarousel */}
      <div style={{ cursor: 'grab' }}>
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
        className="p-3 group/details cursor-pointer"
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-lg">
          {item.title}
          {isNewItem(item.date) && (
            <span className="ml-1 text-xs font-bold text-red-500 inline-flex">
              <span className="animate-bounce" style={{animationDelay: '0ms'}}>N</span>
              <span className="animate-bounce" style={{animationDelay: '100ms'}}>e</span>
              <span className="animate-bounce" style={{animationDelay: '200ms'}}>w</span>
            </span>
          )}
        </h3>
        
        {item.date && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString('ko-KR')}
            </p>
            
            {/* See more 버튼 */}
            {item.description && (
              <span className="text-xs sm:text-sm text-gray-500 group-hover/details:underline group-hover/details:text-interactive-primary transition-all duration-200">
                See more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// React.memo로 메모이제이션
export const GalleryItem = React.memo(GalleryItemComponent); 
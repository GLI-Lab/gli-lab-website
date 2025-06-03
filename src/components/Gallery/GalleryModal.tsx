'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { GalleryItem } from './types';
import { Separator } from '../ui/separator';
import { ImageCarousel } from './ImageCarousel';
import { isNewItem } from './helpers';

interface GalleryModalProps {
  item: GalleryItem;
  onClose: () => void;
}

export function GalleryModal({ item, onClose }: GalleryModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [imageDisplayMode, setImageDisplayMode] = useState<'contain' | 'cover'>('cover');
  const [isZoomEnabled, setIsZoomEnabled] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // ------------------------------------------------------------
  // 현재 이미지 변경 시 비율 확인
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      checkImageRatio(img.naturalWidth, img.naturalHeight);
    };
    img.src = item.images[currentImageIndex];
  }, [currentImageIndex, item.images]);

  // 이미지 비율 확인 함수
  const checkImageRatio = (naturalWidth: number, naturalHeight: number) => {
    const imageRatio = naturalWidth / naturalHeight;
    const targetRatio = 4 / 3; // 1.333...
    const tolerance = 0.15; // 허용 오차
    
    // 현재 aspect-[4/3]와 비슷한 비율이면 줌 비활성화
    const shouldDisableZoom = Math.abs(imageRatio - targetRatio) < tolerance;
    setIsZoomEnabled(!shouldDisableZoom);
  };
  // ------------------------------------------------------------

  // ------------------------------------------------------------
  const checkBottom = () => {
    if (contentRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = contentRef.current;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 10;
      setIsAtBottom(atBottom);
    }
  };

  const handleScroll = () => {
    checkBottom();
  };

  // 컴포넌트 마운트 시 스크롤 상태 확인 및 윈도우 리사이즈 감지
  useEffect(() => {
    const timer = setTimeout(checkBottom, 100);
    
    // 윈도우 리사이즈 이벤트 리스너 추가
    const handleResize = () => {
      checkBottom();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [item]);
  // ------------------------------------------------------------

  // 배경 스크롤 방지
  useEffect(() => {
    // 모달이 열릴 때 배경 스크롤 방지
    document.body.style.overflow = 'hidden';
    
    return () => {
      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = 'auto';
    };
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 배경 클릭으로 모달 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] max-w-4xl w-full bg-white rounded-lg overflow-hidden relative">
        {/* 닫기버튼 */}
          <button
            onClick={onClose}
            className="absolute top-1 right-1 z-[200]"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

        {/* 콘텐츠 (주소창 고려해서 -60px) */}
        <div 
          ref={contentRef}
          className="overflow-y-auto max-h-[calc(90vh-20px)] relative overscroll-none" 
          onScroll={handleScroll}
        >
          {/* 이미지 섹션 */}
          <div 
            className={`relative ${
              isZoomEnabled 
                ? (imageDisplayMode === 'contain' ? 'cursor-zoom-in' : 'cursor-zoom-out')
                : 'cursor-default'
            }`}
            onClick={isZoomEnabled ? () => setImageDisplayMode(prev => prev === 'contain' ? 'cover' : 'contain') : undefined}
          >
            <ImageCarousel
              images={item.images}
              title={item.title}
              className="relative aspect-[4/3]"
              imageClassName={`object-${imageDisplayMode}`}
              sizes="100vw"
              currentIndex={currentImageIndex}
              onImageChange={handleImageChange}
            />
            
            {/* 이미지 표시 모드 전환 버튼 */}
            {isZoomEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageDisplayMode(prev => prev === 'contain' ? 'cover' : 'contain');
                }}
                className="absolute top-2 left-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-1.5 text-white transition-all"
                title={imageDisplayMode === 'contain' ? '이미지 채우기' : '이미지 맞추기'}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </button>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="p-4 sm:p-6">
            {/* 타이틀 */}
            <div className="mb-2">
              <div className="text-xl font-bold text-gray-900">
                {item.title}
                {isNewItem(item.date) && (
                  <span className="ml-1 text-xs font-bold text-red-500 inline-flex">
                    <span className="animate-bounce" style={{animationDelay: '0ms'}}>N</span>
                    <span className="animate-bounce" style={{animationDelay: '100ms'}}>e</span>
                    <span className="animate-bounce" style={{animationDelay: '200ms'}}>w</span>
                  </span>
                )}
              </div>
            </div>
            
            {item.date && (
                <p className="text-gray-900">
                  {new Date(item.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
            )}

            <Separator className="my-3"/>

            {item.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wide mb-2">
                  Description
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </div>
              </div>
            )}

            {/* 썸네일 그리드 - 높이 고정 */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wide mb-2">
                Images
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-brand-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${item.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 - 모달 전체 하단에 고정 */}
        <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ease-in-out ${
          !isAtBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/95 via-white/60 to-white/0 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/100 via-white/80 to-transparent pointer-events-none"></div>
          <div className={`absolute bottom-1.5 left-0 right-0 flex justify-center items-center pointer-events-none transform transition-all duration-300 ease-in-out ${
            !isAtBottom ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
          }`}>
            <svg
              className="h-5 text-interactive-primary animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 
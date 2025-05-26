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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // ------------------------------------------------------------
  const checkBottom = () => {
    if (contentRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = contentRef.current;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 20;
      setIsAtBottom(atBottom);
    }
  };

  const handleScroll = () => {
    checkBottom();
  };

  // 컴포넌트 마운트 시 스크롤 상태 확인
  useEffect(() => {
    const timer = setTimeout(checkBottom, 100);
    return () => clearTimeout(timer);
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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* 헤더 */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-3 z-[200] text-5xl text-interactive-primary font-light"
          >
            &times;
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex flex-col max-h-[calc(90vh-80px)] relative">
          {/* 이미지 섹션 */}
          <div className="relative">
            <ImageCarousel
              images={item.images}
              title={item.title}
              className="relative aspect-[4/3] bg-gray-100"
              imageClassName="object-contain"
              sizes="100vw"
              currentIndex={currentImageIndex}
              onImageChange={handleImageChange}
            />
          </div>

          {/* 정보 섹션 */}
          <div 
            ref={contentRef}
            className="gallery-modal-content p-6 overflow-y-auto flex-1" 
            onScroll={handleScroll}
          >
            {/* 타이틀 */}
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {item.title}
                {isNewItem(item.date) && (
                  <span className="ml-1 text-xs font-bold text-red-500 inline-flex">
                    <span className="animate-bounce" style={{animationDelay: '0ms'}}>N</span>
                    <span className="animate-bounce" style={{animationDelay: '100ms'}}>e</span>
                    <span className="animate-bounce" style={{animationDelay: '200ms'}}>w</span>
                  </span>
                )}
              </h2>
            </div>
            
            {item.date && (
              <div className="mb-4">
                <p className="text-gray-900">
                  {new Date(item.date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
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
                  className={`relative w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-blue-500' 
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

          {/* 스크롤 인디케이터 - 모달 전체 하단에 위치 */}
          {!isAtBottom && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center pointer-events-none">
                <svg
                  className="w-8 h-4 ml-2 text-interactive-primary animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2 9l10 10 10-10" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
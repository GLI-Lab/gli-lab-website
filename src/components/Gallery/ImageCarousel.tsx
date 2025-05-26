'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  onImageChange
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [Fade()]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const onImageNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onImagePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const goToSlide = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className={`${className} group`}>
      <div className="overflow-hidden h-full" ref={emblaRef}>
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
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 이미지 네비게이션 */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={onImagePrev}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all bg-white bg-opacity-60 text-gray-700 p-2 rounded-full hover:bg-white hover:bg-opacity-95 hover:text-gray-900 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onImageNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all bg-white bg-opacity-60 text-gray-700 p-2 rounded-full hover:bg-white hover:bg-opacity-95 hover:text-gray-900 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onClick={() => goToSlide(index)}
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
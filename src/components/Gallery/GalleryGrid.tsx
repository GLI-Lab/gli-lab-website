'use client';

import { useState } from 'react';
import { GalleryItem as GalleryItemType } from './types';
import { GalleryModal } from './GalleryModal';
import { GalleryItem } from './GalleryItem';

interface GalleryGridProps {
  items: GalleryItemType[];
  className?: string;
}

export function GalleryGrid({ items, className = "" }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItemType | null>(null);

  // console.log('----GalleryGrid');  // 컴포넌트가 렌더링될 때마다 로그 출력

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 md:gap-y-12 ${className}`}>
        {items.map((item) => {
          return (
            <GalleryItem
              key={item.id}
              item={item}
              onCardClick={setSelectedItem}
            />
          );
        })}
      </div>

      {/* 상세 모달 */}
      {selectedItem && (
        <GalleryModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
} 
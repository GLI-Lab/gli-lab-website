"use client"

import { useEffect, useState } from 'react';

interface StudyHighlightWrapperProps {
  children: React.ReactNode;
  studyId: string;
}

export function StudyHighlightWrapper({ children, studyId }: StudyHighlightWrapperProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#study-')) {
      const targetId = hash.substring(1); // # 제거
      
      if (targetId === studyId) {
        setIsHighlighted(true);
        
        // 스크롤 후 하이라이트 효과
        const timer = setTimeout(() => {
          const element = document.getElementById(studyId);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);
        
        // 3초 후 하이라이트 제거
        const highlightTimer = setTimeout(() => {
          setIsHighlighted(false);
        }, 3000);
        
        return () => {
          clearTimeout(timer);
          clearTimeout(highlightTimer);
        };
      }
    }
  }, [studyId]);

  return (
    <div 
      id={studyId}
      className={`bg-white rounded-lg border transition-all duration-300 overflow-hidden group flex flex-col h-full ${
        isHighlighted 
          ? 'border-brand-primary shadow-lg ring-2 ring-brand-primary/20 animate-pulse' 
          : 'border-gray-300 hover:border-interactive-primary hover:shadow-lg'
      }`}
    >
      {children}
    </div>
  );
} 
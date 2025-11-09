"use client"

import { useEffect, useState } from 'react';

interface StudyHighlightWrapperProps {
  children: React.ReactNode;
  studyId: string;
}

export function StudyHighlightWrapper({ children, studyId }: StudyHighlightWrapperProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#study-')) {
        const targetId = hash.substring(1); // # 제거
        
        if (targetId === studyId) {
          setIsHighlighted(true);
          
          // 이전 타이머 정리
          if (highlightTimer) clearTimeout(highlightTimer);
          
          // 즉시 중앙으로 스크롤 (애니메이션 없음)
          // requestAnimationFrame을 사용하여 DOM 렌더링 후 실행
          let attempts = 0;
          const maxAttempts = 10; // 최대 10번 시도 (약 160ms, 60fps 기준)
          const scrollToElement = () => {
            const element = document.getElementById(studyId);
            if (element) {
              element.scrollIntoView({
                behavior: 'auto',
                block: 'center'
              });
            } else if (attempts < maxAttempts) {
              attempts++;
              requestAnimationFrame(scrollToElement);
            }
          };
          requestAnimationFrame(scrollToElement);
          
          // 1.5초 후 하이라이트 제거
          highlightTimer = setTimeout(() => {
            setIsHighlighted(false);
          }, 1500);
        }
      }
    };

    // 초기 로드 시 확인
    checkHash();

    // 해시 변경 감지
    const handleHashChange = () => {
      checkHash();
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [studyId]);

  return (
    <div 
      id={studyId}
      className={`rounded-lg border transition-all duration-300 overflow-hidden group flex flex-col h-full ${
        isHighlighted 
          ? 'bg-brand-primary/10 border-brand-primary shadow-lg animate-pulse' 
          : 'border-gray-300 hover:border-interactive-primary hover:shadow-lg'
      }`}
    >
      {children}
    </div>
  );
} 
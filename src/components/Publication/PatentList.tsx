"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { PatentData } from '@/data/loaders/types';

// 제목을 URL-safe ID로 변환하는 함수
function titleToId(title: string): string {
  // 제목을 소문자로 변환하고, 공백을 하이픈으로, 특수문자 제거 (한글 포함)
  // 한글 유니코드 범위: \uAC00-\uD7A3 (가-힣)
  // 하이픈(-)을 이스케이프하거나 문자 클래스의 끝에 배치해야 함
  const id = title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, '') // 특수문자 제거 (한글은 유지, 하이픈은 끝에 배치)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
  
  return id;
}

interface PatentListProps {
  className?: string
  patents: PatentData[];
  memberIds?: string[];
  alumniIds?: string[];
}

export default function PatentList({ className = '', patents, memberIds = [], alumniIds = [] }: PatentListProps) {
  const [filterType, setFilterType] = useState<'all' | 'filed' | 'registered'>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'international' | 'domestic'>('all');
  const [triggerAnimation, setTriggerAnimation] = useState(0);
  const [highlightedPatentId, setHighlightedPatentId] = useState<string | null>(null);

  // Animation trigger functions
  const triggerFilterAnimation = () => {
    setTriggerAnimation(prev => prev + 1);
  };

  const handleFilterTypeChange = (type: 'all' | 'filed' | 'registered') => {
    setFilterType(type);
    triggerFilterAnimation();
  };

  const handleFilterScopeChange = (scope: 'all' | 'international' | 'domestic') => {
    setFilterScope(scope);
    triggerFilterAnimation();
  };

  // ID 리스트를 사용한 빠른 검증 함수들
  const isValidProfileId = (id: string) => memberIds.includes(id) || alumniIds.includes(id);
  const isAlumniProfile = (id: string) => alumniIds.includes(id);

  // 날짜를 "YYYY년 MM월 DD일" 형식으로 변환
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // Render author with appropriate symbols
  const renderAuthors = (patent: PatentData) => {
    return patent.authors.map((author, i) => {
      const hasId = !!author.ID;
      const hasValidId = hasId && author.ID && isValidProfileId(author.ID);
      
      const authorName = (
        <span className={hasValidId ? 'decoration-gray-500 hover:decoration-brand-primary underline underline-offset-[3px]' : ''}>
          {author.name}
        </span>
      );
      
      return (
        <span key={i}>
          {hasValidId ? (
            <Link 
              href={`/people/${author.ID && isAlumniProfile(author.ID) ? 'alumni' : 'members'}/?id=${encodeURIComponent(author.ID!)}`}
              className="hover:text-brand-primary transition-colors"
            >
              {authorName}
            </Link>
          ) : hasId ? (
            <span 
              className="text-red-500"
              title={`Profile not found: ${author.ID}`}
            >
              {authorName}
            </span>
          ) : (
            authorName
          )}
          {i < patent.authors.length - 1 && ', '}
        </span>
      );
    });
  };

  // 필터링된 특허
  const filteredPatents = useMemo(() => {
    return patents.filter(patent => {
      // Type 필터: all, filed, registered
      const hasFiled = patent.status.filed.date !== null && patent.status.filed.number !== null;
      const hasRegistered = patent.status.registered.date !== null && patent.status.registered.number !== null;
      
      if (filterType === 'filed' && !hasFiled) return false;
      if (filterType === 'registered' && !hasRegistered) return false;
      if (filterType === 'all' && !hasFiled && !hasRegistered) return false;
      
      // Scope 필터: all, international, domestic
      if (filterScope !== 'all' && patent.scope !== filterScope) return false;
      
      return true;
    });
  }, [patents, filterType, filterScope]);

  // 특허를 년도별로 그룹화하고 정렬
  const patentsByYear = useMemo(() => {
    // 출원일이 있는 특허만 필터링
    const validPatents = filteredPatents.filter(patent => 
      patent.status.filed.date !== null && patent.status.filed.number !== null
    );

    // 등록일이 있으면 등록일 기준, 없으면 출원일 기준으로 정렬
    const sortedPatents = validPatents.sort((a, b) => {
      const aDate = a.status.registered.date || a.status.filed.date;
      const bDate = b.status.registered.date || b.status.filed.date;
      
      if (!aDate || !bDate) return 0;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    // 년도별로 그룹화
    const grouped = sortedPatents.reduce((acc, patent) => {
      // 등록일이 있으면 등록일의 년도, 없으면 출원일의 년도 사용
      const dateStr = patent.status.registered.date || patent.status.filed.date;
      if (!dateStr) return acc;
      
      const date = new Date(dateStr);
      const year = date.getFullYear().toString();
      
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(patent);
      return acc;
    }, {} as Record<string, PatentData[]>);

    return grouped;
  }, [filteredPatents]);

  // URL 해시를 확인하여 하이라이트 처리
  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const checkHash = () => {
      const hash = window.location.hash;
      if (hash) {
        // # 제거하고 디코딩 (한글이 포함될 수 있음)
        const targetId = decodeURIComponent(hash.substring(1));
        
        // 해당 특허가 필터링된 목록에 있는지 확인
        const targetPatent = filteredPatents.find(p => titleToId(p.title) === targetId);
        if (targetPatent) {
          setHighlightedPatentId(targetId);
          
          // 이전 타이머 정리
          if (highlightTimer) clearTimeout(highlightTimer);
          
          // 즉시 중앙으로 스크롤 (애니메이션 없음)
          // requestAnimationFrame을 사용하여 DOM 렌더링 후 실행
          let attempts = 0;
          const maxAttempts = 10; // 최대 10번 시도 (약 160ms, 60fps 기준)
          const scrollToElement = () => {
            const element = document.getElementById(targetId);
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
            setHighlightedPatentId(null);
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
  }, [filteredPatents]);

  // Calculate counts
  const visiblePatentsCount = filteredPatents.length;
  const totalPatentsCount = patents.length;

  // 년도를 내림차순으로 정렬
  const years = Object.keys(patentsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // 특허 정보 렌더링
  const renderPatentInfo = (patent: PatentData) => {
    const filed = patent.status.filed;
    const registered = patent.status.registered;
    
    const parts: string[] = [];
    
    if (filed.date && filed.number) {
      parts.push(`출원번호 제 ${filed.number} 호, 출원일 ${formatDate(filed.date)}`);
    }
    
    if (registered.date && registered.number) {
      parts.push(`등록번호 제 ${registered.number} 호, 등록일 ${formatDate(registered.date)}`);
    }
    
    return parts.join(', ');
  };

  return (
    <div className={`${className}`}>
      {/* Controls + Patent Count + Legend */}
      <div className="mb-8 md:mb-14 space-y-3 text-sm md:text-base font-normal">
        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 md:px-6 md:py-4 shadow-sm flex items-center justify-between gap-x-6 gap-y-2 md:gap-y-3 flex-wrap font-medium">
          {/* Filter Buttons  */}
          <div className="flex gap-x-4 md:gap-x-8 gap-y-2 flex-wrap">
            {/* (1) Type Filter */}
            <div className="flex items-center gap-1 pl-0">
              <span className="text-gray-700 min-w-[50px] md:min-w-[0px] md:pr-2">Type:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleFilterTypeChange('all')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterType === 'all'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterTypeChange('filed')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterType === 'filed'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Filed (출원)
                </button>
                <button
                  onClick={() => handleFilterTypeChange('registered')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterType === 'registered'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Registered (등록)
                </button>
              </div>
            </div>

            {/* (2) Scope Filter */}
            <div className="flex items-center gap-1">
              <span className="text-gray-700 min-w-[50px] md:min-w-[0px] md:pr-2">Scope:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleFilterScopeChange('all')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterScope === 'all'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterScopeChange('international')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterScope === 'international'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  International
                </button>
                <button
                  onClick={() => handleFilterScopeChange('domestic')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterScope === 'domestic'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Domestic
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Patent Count & Legend */}
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 md:gap-6 mx-2 md:mx-4">
          {/* Patent Count */}
          <div className="text-base md:text-lg flex items-center gap-3">
            <span>
              Total <span className="font-semibold text-gray-900">{visiblePatentsCount}</span> of <span className="font-semibold text-gray-900">{totalPatentsCount}</span> patents
            </span>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col md:items-end gap-1 text-gray-600">
            <div>
              <span className="decoration-gray-500 underline underline-offset-[3px]">Name</span>
              : GLI Lab (
              <span>Click for detailed profile</span>
              )
            </div>
          </div>
        </div>
      </div>

      {/* Patents by Year */}
      {years.map(year => (
        <div key={`${year}-${triggerAnimation}-${filterType}-${filterScope}`} className="text-base md:text-lg mb-10 md:mb-14 transform transition-all duration-500 ease-out animate-in slide-in-from-top-2 fade-in">
          <SectionHeader 
            title={year} 
            className="" 
            underline={true} 
            size="small"
          />
          <ul className="list-disc space-y-6 md:space-y-8 pl-5 md:pl-6">
            {patentsByYear[year].map((patent, index) => {
              const patentId = titleToId(patent.title);
              const isHighlighted = highlightedPatentId === patentId;
              return (
                <li 
                  key={index} 
                  id={patentId}
                  className="leading-normal"
                >
                  <div className={`transition-colors duration-300 ${
                    isHighlighted 
                      ? 'bg-brand-primary/10 shadow-lg animate-pulse' 
                      : ''
                  }`}>
                    <div className="text-gray-700 font-semibold mb-1">
                      {patent.title}
                    </div>
                    <div className="text-gray-600 mb-1">
                      {renderAuthors(patent)}
                    </div>
                    <div className="text-gray-600 mb-1">
                      {renderPatentInfo(patent)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      
      {/* Sticky positioning을 위한 하단 여백 */}
      <div className={visiblePatentsCount < 10 ? "h-[50vh]" : "h-[10vh]"}></div>
    </div>
  );
}


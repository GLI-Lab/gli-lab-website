"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileHoverLink } from "@/components/Profile/ProfileHoverLink";
import SectionHeader from "@/components/ui/SectionHeader";
import { PatentData, type ProfileLinks } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';
import { buildPublicationPath, getPublicationIdFromPathname, PATENTS_BASE_PATH } from '@/lib/publicationSlug';
import { copyLinkWithToast } from '@/lib/copyLink';

interface PatentListProps {
  className?: string
  patents: PatentData[];
  /** 사람 ID → 프로필 링크 사전 (서버의 getProfileLinks() 결과) */
  profileLinks?: ProfileLinks;
}

export default function PatentList({ className = '', patents, profileLinks = {} }: PatentListProps) {
  const pathname = usePathname();
  const [filterType, setFilterType] = useState<'all' | 'filed' | 'registered'>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'international' | 'domestic'>('all');
  const [triggerAnimation, setTriggerAnimation] = useState(0);
  const [highlightedPatentId, setHighlightedPatentId] = useState<string | null>(null);
  const [copiedPatentId, setCopiedPatentId] = useState<string | null>(null);

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
      const profile = author.ID ? profileLinks[author.ID] : undefined;
      const href = profile?.href ?? null;
      const hasValidId = !!href;
      
      const authorName = (
        <span className={hasValidId ? 'underline decoration-dotted decoration-gray-400 underline-offset-4 hover:decoration-solid hover:decoration-brand-primary' : ''}>
          {author.name}
        </span>
      );
      
      return (
        <span key={i}>
          {hasValidId && profile ? (
            <ProfileHoverLink
              profile={profile}
              className="hover:text-brand-primary transition-colors"
            >
              {authorName}
            </ProfileHoverLink>
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

  // 주소의 slug(/publications/patents/<id>/)를 확인하여 해당 특허로 스크롤·하이라이트 처리
  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const highlightTarget = () => {
      // 대상 특허의 id. 목록 주소(/publications/patents/)면 null이라 아무것도 하지 않는다.
      const targetId = getPublicationIdFromPathname(pathname, PATENTS_BASE_PATH);
      if (targetId) {
        
        // 해당 특허가 필터링된 목록에 있는지 확인
        const targetPatent = filteredPatents.find(p => titleToId(p.title.ko) === targetId);
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

    // 처음 들어왔을 때와 주소·필터가 바뀔 때마다 확인 (값이 바뀌면 이 effect가 다시 실행된다)
    highlightTarget();

    return () => {
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [filteredPatents, pathname]);

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
      parts.push(`출원번호 ${filed.number}, 출원일 ${formatDate(filed.date)}`);
    }
    
    if (registered.date && registered.number) {
      parts.push(`등록번호 ${registered.number}, 등록일 ${formatDate(registered.date)}`);
    }
    
    return parts.join(', ');
  };

  const renderCopyButton = (patentId: string) => {
    const copied = copiedPatentId === patentId;

    return (
      <>
      {/* URL 복사 링크 아이콘 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // 특허마다 자기 주소를 복사한다. 이 주소로 공유해야 카드에 특허 제목이 나온다 (#id는 서버에 전달되지 않음).
          const currentUrl = `${window.location.origin}${buildPublicationPath(PATENTS_BASE_PATH, patentId)}`;

          // 주소를 복사하고 버튼 옆에 "Link copied!"를 띄운다 (화면 밖으로 나가지 않는 자리를 고름)
          copyLinkWithToast(currentUrl, e.currentTarget);

          // 아이콘을 1초 동안 체크표시로 변경
          setCopiedPatentId(patentId);
          setTimeout(() => {
            setCopiedPatentId(prev => (prev === patentId ? null : prev));
          }, 1000);
        }}
        className={`relative -top-[1px] md:-top-[2px] ml-0.5 md:ml-1 inline-flex h-5 w-5 items-center justify-center align-middle transition-colors duration-200 ${copied ? 'text-brand-primary' : 'text-gray-400 hover:text-interactive-primary'}`}
        title="Copy patent link"
        aria-label="Copy patent link"
      >
        {copied ? (
          <svg className="md:w-[90%] md:h-[90%] w-[80%] h-[80%] mx-auto my-auto origin-center scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="md:w-[90%] md:h-[90%] w-[80%] h-[80%] mx-auto my-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
      </>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Controls + Patent Count + Legend */}
      <div className="mb-8 md:mb-14 space-y-3 text-sm md:text-base font-normal">
        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-1.5 md:px-6 md:py-2.5 shadow-sm flex items-center justify-between gap-x-6 gap-y-2 md:gap-y-3 flex-wrap font-medium text-[13px] md:text-[15px]">
          {/* Filter Buttons  */}
          <div className="flex gap-x-4 md:gap-x-8 gap-y-2 flex-wrap">
            {/* (1) Type Filter */}
            <div className="flex items-center gap-1 pl-0">
              <span className="text-gray-700 min-w-[50px] md:min-w-[0px] md:pr-2">Type:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleFilterTypeChange('all')}
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
                    filterType === 'all'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterTypeChange('filed')}
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
                    filterType === 'filed'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Filed (출원)
                </button>
                <button
                  onClick={() => handleFilterTypeChange('registered')}
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
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
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
                    filterScope === 'all'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterScopeChange('international')}
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
                    filterScope === 'international'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  International
                </button>
                <button
                  onClick={() => handleFilterScopeChange('domestic')}
                  className={`px-3 py-0.5 md:py-1 rounded-md transition-all duration-200 ${
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
          
          {/* Legend. 넓은 화면에서는 주변 글자(16px)보다 한 단계 작은 15px */}
          <div className="flex flex-col md:items-end gap-1 text-gray-600 md:text-[15px]">
            <div>
              <span className="underline decoration-dotted decoration-gray-400 underline-offset-4">Name</span>
              : GLI Lab (hover/click for profile)
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
              const patentId = titleToId(patent.title.ko);
              const isHighlighted = highlightedPatentId === patentId;
              return (
                <li 
                  key={index} 
                  id={patentId}
                  className="relative leading-normal"
                >
                  {isHighlighted && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-1.5 -bottom-1.5 -right-1 -left-6 rounded-xl bg-brand-primary/10 animate-highlight-pulse md:-right-2 md:-left-8"
                    />
                  )}
                  <div className={isHighlighted ? "animate-highlight-pulse" : undefined}>
                    <div className="text-[16px] md:text-[18px] font-medium text-gray-800 mb-1">
                      <div className="leading-tight md:leading-snug">
                        {patent.title.ko}
                        {renderCopyButton(patentId)}
                      </div>
                      <div className="text-[14.5px] md:text-[16.5px] font-normal leading-tight">
                        {patent.title.en}
                      </div>
                    </div>
                    <div className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                      {renderAuthors(patent)}
                    </div>
                    <div className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                      {renderPatentInfo(patent)}
                    </div>
                    {patent.link && (
                      <div className="flex items-center gap-2 mt-2">
                        <a 
                          href={patent.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-0.25 text-xs md:text-sm text-gray-600 bg-white border border-gray-500 hover:bg-interactive-primary hover:border-interactive-primary hover:text-white transition-colors"
                        >
                          Link
                        </a>
                      </div>
                    )}
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


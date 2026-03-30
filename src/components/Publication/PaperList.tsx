"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { PaperData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';


interface PaperListProps {
  className?: string
  papers: PaperData[];
  memberIds?: string[];
  alumniIds?: string[];
  initialShowInProgress?: boolean;
}

export default function PaperList({ className = '', papers, memberIds = [], alumniIds = [], initialShowInProgress = false }: PaperListProps) {
  // 서버에서 전달된 초기값 사용
  const [showInProgress, setShowInProgress] = useState(initialShowInProgress);
  const [showUnderReview, setShowUnderReview] = useState(true);
  const [isInProgressExpanded, setIsInProgressExpanded] = useState(initialShowInProgress);
  const [isUnderReviewExpanded, setIsUnderReviewExpanded] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'journal' | 'conference'>('all');
  const [filterScope, setFilterScope] = useState<'all' | 'international' | 'domestic'>('international');
  const [triggerAnimation, setTriggerAnimation] = useState(0);
  const [highlightedPaperId, setHighlightedPaperId] = useState<string | null>(null);
  const [copiedPaperId, setCopiedPaperId] = useState<string | null>(null);

  // Animation trigger functions
  const triggerFilterAnimation = () => {
    setTriggerAnimation(prev => prev + 1);
  };

  const handleFilterTypeChange = (type: 'all' | 'journal' | 'conference') => {
    setFilterType(type);
    // Type 필터 변경 시 섹션들 접기 (show 상태는 유지)
    setIsInProgressExpanded(false);
    setIsUnderReviewExpanded(false);
    triggerFilterAnimation();
  };

  const handleFilterScopeChange = (scope: 'all' | 'international' | 'domestic') => {
    setFilterScope(scope);
    // Scope 필터 변경 시 섹션들 접기 (show 상태는 유지)
    setIsInProgressExpanded(false);
    setIsUnderReviewExpanded(false);
    triggerFilterAnimation();
  };

  // Calculate total publications based on toggle states
  const totalPublications = useMemo(() => {
    return papers.filter(publication => {
      // Always include accepted papers
      if (publication.status === 'Accepted') {
        return true;
      }
      
      // Include under review papers only if toggle is on
      if (publication.status === 'Under Review') {
        return showUnderReview;
      }
      
      // Include in progress papers only if toggle is on
      if (publication.status === 'In Progress') {
        return showInProgress;
      }
      
      return false;
    });
  }, [papers, showUnderReview, showInProgress]);

  // Filter publications based on current filters
  const filteredPublications = useMemo(() => {
    return totalPublications.filter(publication => {
      // For In Progress and Under Review papers, always include them regardless of type/scope filters
      if (publication.status === 'In Progress' || publication.status === 'Under Review') {
        return true;
      }
      
      // For Accepted papers, apply type and scope filters
      const typeMatch = filterType === 'all' || publication.filter.type === filterType;
      const scopeMatch = filterScope === 'all' || publication.filter.scope === filterScope;
      return typeMatch && scopeMatch;
    });
  }, [totalPublications, filterType, filterScope]);

  // URL 해시를 확인하여 하이라이트 처리
  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const checkHash = () => {
      const hash = window.location.hash;
      if (hash) {
        // # 제거하고 디코딩 (한글이 포함될 수 있음)
        const targetId = decodeURIComponent(hash.substring(1));
        
        // 해당 논문이 필터링된 목록에 있는지 확인
        const targetPaper = filteredPublications.find(p => titleToId(p.title) === targetId);
        if (targetPaper) {
          setHighlightedPaperId(targetId);
          
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
            setHighlightedPaperId(null);
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
  }, [filteredPublications]);

  // Group publications by year (only Accepted papers)
  const publicationsByYear = filteredPublications
    .filter(pub => pub.status === 'Accepted')
    .reduce((acc, publication) => {
      const year = publication.year || 'Unknown';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(publication);
      return acc;
    }, {} as Record<string, PaperData[]>);

  // Get years in reverse order (newest first)
  const years = Object.keys(publicationsByYear).reverse();

  // Calculate counts
  const visiblePapersCount = filteredPublications.length;
  const totalPossiblePapersCount = totalPublications.length;

  // Render venue with acronym in semibold
  const renderVenue = (venue: { name: string; acronym: string } | null) => {
    if (!venue) return null;
    if (!venue.name) return null;
    if (!venue.acronym) return venue.name;
    return (
      <>
        {/* {venue.name} (<span className="font-semibold">{venue.acronym}</span>) */}
        {venue.name} (<span className="font-semibold">{venue.acronym}</span>)
      </>
    );
  };

  // ID 리스트를 사용한 빠른 검증 함수들
  const isValidProfileId = (id: string) => memberIds.includes(id) || alumniIds.includes(id);
  const isAlumniProfile = (id: string) => alumniIds.includes(id);

  // Render author with appropriate symbols (optimized with useMemo per publication)
  const renderAuthors = (publication: PaperData) => {
    const firstAuthors = publication.authors.filter(a => a.position === 'first');
    const hasMultipleFirstAuthors = firstAuthors.length > 1;
    
    return publication.authors.map((author, i) => {
      const isFirstAuthor = author.position === 'first';
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
          {author.isCorresponding && '*'}
          {isFirstAuthor && hasMultipleFirstAuthors && <sup className="pl-[1px]">‡</sup>}
          {i < publication.authors.length - 1 && ', '}
        </span>
      );
    });
  };

  const renderCopyButton = (paperId: string) => {
    const copied = copiedPaperId === paperId;

    return (
      <>
      {/* URL 복사 링크 아이콘 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#${encodeURIComponent(paperId)}`;

          // 클립보드 복사 시도 (지원되지 않는 경우 selectionless fallback)
          const selectionlessCopy = () => {
            try {
              const listener = (event: ClipboardEvent) => {
                event.preventDefault();
                event.clipboardData?.setData('text/plain', currentUrl);
              };
              document.addEventListener('copy', listener);
              document.execCommand('copy');
              document.removeEventListener('copy', listener);
            } catch {
              // 마지막 수단: 아무 동작 안 함 (iOS에서 입력 포커스 회피)
            }
          };

          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(currentUrl).catch(selectionlessCopy);
          } else {
            selectionlessCopy();
          }

          // 버튼 옆 토스트 (고정 위치, 버튼 오른쪽에 표시)
          const buttonRect = e.currentTarget.getBoundingClientRect();
          const toast = document.createElement('div');
          toast.textContent = 'Link copied!';
          toast.className = 'fixed bg-gray-600 text-white px-3 py-1.5 rounded-md shadow-md text-[15px] font-medium z-[1000] pointer-events-none';
          toast.style.left = `${buttonRect.right + 10}px`;
          toast.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
          toast.style.transform = 'translateY(-50%)';
          document.body.appendChild(toast);

          // 1초 후 토스트 제거
          setTimeout(() => {
            if (toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 1000);

          // 아이콘을 1초 동안 체크표시로 변경
          setCopiedPaperId(paperId);
          setTimeout(() => {
            setCopiedPaperId(prev => (prev === paperId ? null : prev));
          }, 1000);
        }}
        className={`mt-0.5 w-5 h-5 transition-colors duration-200 flex-shrink-0 ${copied ? 'text-brand-primary' : 'text-gray-400 hover:text-interactive-primary'}`}
        title="Copy paper link"
        aria-label="Copy paper link"
      >
        {copied ? (
          <svg className="w-[90%] h-[90%] mx-auto my-auto origin-center scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-[90%] h-[90%] mx-auto my-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
      </>
    );
  };


  return (
    <div className={`${className}`}>
      {/* Controls + Paper Count + Legend */}
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
                  onClick={() => handleFilterTypeChange('journal')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterType === 'journal'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Journal
                </button>
                <button
                  onClick={() => handleFilterTypeChange('conference')}
                  className={`px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                    filterType === 'conference'
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Conference
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

          {/* Ongoing Work Toggles */}
          <div className="flex gap-x-4 md:gap-x-8 gap-y-2 flex-wrap flex-shrink-0 pr-0">
            {/* In Progress Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700">In Progress</span>
              <button
                onClick={() => {
                  setShowInProgress(!showInProgress);
                  // 토글 ON일 때 섹션도 펼치기
                  if (!showInProgress) {
                    setIsInProgressExpanded(true);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  showInProgress ? 'bg-brand-primary' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showInProgress}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                    showInProgress ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Under Review Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Under Review</span>
              <button
                onClick={() => {
                  setShowUnderReview(!showUnderReview);
                  // 토글 ON일 때 섹션도 펼치기
                  if (!showUnderReview) {
                    setIsUnderReviewExpanded(true);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  showUnderReview ? 'bg-brand-primary' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={showUnderReview}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                    showUnderReview ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Paper Count & Legend */}
        <div className="flex flex-col md:flex-row md:justify-between items-start gap-4 md:gap-6 mx-2 md:mx-4">
          {/* Paper Count */}
          <div className="text-base md:text-lg flex items-center gap-3">
            <span>
              Total <span className="font-semibold text-gray-900">{visiblePapersCount}</span> of <span className="font-semibold text-gray-900">{totalPossiblePapersCount}</span> papers
            </span>
          </div>
          
          {/* Legend */}
          <div className="flex flex-col md:items-end gap-1 text-gray-600">
            <div className="flex items-center gap-4 md:gap-6 gap-y-1 flex-wrap">
              <span>‡ Equal Contribution</span>
              <span>* Corresponding Author</span>
            </div>
            <div>
              <span className="decoration-gray-500 underline underline-offset-[3px]">Name</span>
              : GLI Lab (
              <span>Click for detailed profile</span>
              )
            </div>
          </div>
        </div>
      </div>

      {/* In Progress (🛠) */}
      {showInProgress && (
        <div className={`text-base md:text-lg ${isInProgressExpanded ? 'mb-10 md:mb-14' : 'mb-3 md:mb-6'}`}>
          <SectionHeader 
            title="In Progress" 
            className="" 
            underline={true} 
            size="small"
            expandable={true}
            isExpanded={isInProgressExpanded}
            onToggle={() => setIsInProgressExpanded(!isInProgressExpanded)}
          />
          <div className={`transition-all duration-500 ease-out ${
            isInProgressExpanded 
              ? 'opacity-100 max-h-screen overflow-visible transform translate-y-0 animate-in slide-in-from-top-2 fade-in' 
              : 'opacity-0 max-h-0 overflow-hidden transform -translate-y-4'
          }`} key={`inprogress-${triggerAnimation}-${filterType}-${filterScope}`}>
            <ul className="list-disc space-y-6 md:space-y-8 pl-5 md:pl-6">
              {filteredPublications
                .filter(pub => pub.status === 'In Progress')
                .map((publication, index) => {
                  const paperId = titleToId(publication.title);
                  const isHighlighted = highlightedPaperId === paperId;
                  return (
                    <li 
                      key={index} 
                      id={paperId}
                      className="leading-normal"
                    >
                      <div className={`transition-colors duration-300 ${
                        isHighlighted 
                          ? 'bg-brand-primary/10 shadow-lg animate-pulse' 
                          : ''
                      }`}>
                        <div className="flex items-start gap-1.5 text-[16px] md:text-[18px] font-medium text-gray-800 leading-snug mb-1">
                          <span className="font-normal">(🛠)</span> <span>{publication.title}</span>
                          {renderCopyButton(paperId)}
                        </div>
                        <div className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                          {renderAuthors(publication)}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {/* Under Review */}
      {showUnderReview && (
        <div className={`text-base md:text-lg ${isUnderReviewExpanded ? 'mb-10 md:mb-14' : 'mb-3 md:mb-6'}`}>
          <SectionHeader 
            title="Under Review" 
            className="" 
            underline={true} 
            size="small"
            expandable={true}
            isExpanded={isUnderReviewExpanded}
            onToggle={() => setIsUnderReviewExpanded(!isUnderReviewExpanded)}
          />
          <div className={`transition-all duration-500 ease-out ${
            isUnderReviewExpanded 
              ? 'opacity-100 max-h-screen overflow-visible transform translate-y-0 animate-in slide-in-from-top-2 fade-in' 
              : 'opacity-0 max-h-0 overflow-hidden transform -translate-y-4'
          }`} key={`underreview-${triggerAnimation}-${filterType}-${filterScope}`}>
            <ul className="list-disc space-y-6 md:space-y-8 pl-5 md:pl-6">
              {filteredPublications
                .filter(pub => pub.status === 'Under Review')
                .map((publication, index) => {
                  const paperId = titleToId(publication.title);
                  const isHighlighted = highlightedPaperId === paperId;
                  return (
                    <li 
                      key={index} 
                      id={paperId}
                      className="leading-normal"
                    >
                      <div className={`transition-colors duration-300 ${
                        isHighlighted 
                          ? 'bg-brand-primary/10 shadow-lg animate-pulse' 
                          : ''
                      }`}>
                        <div className="flex items-start gap-1.5 text-[16px] md:text-[18px] font-medium text-gray-800 leading-snug mb-1">
                          {publication.title}
                          {renderCopyButton(paperId)}
                        </div>
                        <div className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                          {renderAuthors(publication)}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {/* Publications by Year */}
      {years.map(year => (
        <div key={`${year}-${triggerAnimation}-${filterType}-${filterScope}`} className="text-base md:text-lg mb-10 md:mb-14 transform transition-all duration-500 ease-out animate-in slide-in-from-top-2 fade-in">
          <SectionHeader title={year} className="" underline={true} size="small"/>
          <ul className="list-disc space-y-5 md:space-y-7 pl-5 md:pl-6">
            {publicationsByYear[year].map((publication, index) => {
              const paperId = titleToId(publication.title);
              const isHighlighted = highlightedPaperId === paperId;
              return (
                <li 
                  key={index} 
                  id={paperId}
                  className="leading-normal"
                >
                  <div className={`transition-colors duration-300 ${
                    isHighlighted 
                      ? 'bg-brand-primary/10 shadow-lg animate-pulse' 
                      : ''
                  }`}>
                    <div className="flex items-start gap-1.5 text-[16px] md:text-[18px] font-medium text-gray-800 leading-snug mb-1">
                      {publication.title}
                      {renderCopyButton(paperId)}
                    </div>
                    <div className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                      {renderAuthors(publication)}
                    </div>
                    <div className="italic text-[14.5px] md:text-[16.5px] text-gray-600 leading-snug mb-1">
                      <>{renderVenue(publication.venue)}, {publication.year}{publication.notes?.normal ? ` — ${publication.notes.normal}` : ''}</>
                    </div>
                    {publication.links && Object.entries(publication.links).some(([_, url]) => url) && (
                      <div className="flex items-center gap-2 mt-2">
                        {Object.entries(publication.links)
                          .filter((entry): entry is [string, string] => {
                            const [_, url] = entry;
                            return typeof url === 'string' && url.length > 0;
                          })
                          .map(([key, url]) => (
                            <a 
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-0.25 text-xs md:text-sm text-gray-600 bg-white border border-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              {key}
                            </a>
                          ))
                        }
                        {publication.notes?.important && (
                          <span className="text-sm md:text-base font-medium italic text-red-600">{publication.notes.important}</span>
                        )}
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
      <div className={visiblePapersCount < 10 ? "h-[50vh]" : "h-[10vh]"}></div>
    </div>
  );
}
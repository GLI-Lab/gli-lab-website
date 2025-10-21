"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NewsData } from '@/data/loaders/types';

export interface NewsListProps {
  className?: string
  count?: number | null
  newsItems?: NewsData[]
  memberIds?: string[]
  alumniIds?: string[]
  filterType?: 'Member' | 'Publication' | 'Funding' | 'General' | 'All'
  showFilters?: boolean
}

// check if an item is new (within 3 months)
function isNewItem(date?: string): boolean {
  if (!date) return false;
  const itemDate = new Date(date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
  return itemDate >= sixMonthsAgo;
}

// 뉴스 타입별 카운트를 가져오는 함수
export function getNewsTypeCounts(newsItems: NewsData[]): Record<string, number> {
  const counts: Record<string, number> = {
    'All': newsItems.length,
    'Member': 0,
    'Publication': 0,
    'Funding': 0,
    'General': 0
  };
  
  newsItems.forEach(news => {
    if (news.type in counts) {
      counts[news.type]++;
    }
  });
  
  return counts;
}

// 사용 가능한 뉴스 타입들
export const NEWS_TYPES = ['All', 'Member', 'Publication', 'Funding', 'General'] as const;
export type NewsType = typeof NEWS_TYPES[number];

// 뉴스 데이터에서 연도 추출하는 함수
export function getAvailableYears(newsItems: NewsData[]): number[] {
  const years = new Set<number>();
  newsItems.forEach(news => {
    const year = new Date(news.date).getFullYear();
    years.add(year);
  });
  return Array.from(years).sort((a, b) => b - a); // 최신 연도부터 정렬
}

// 텍스트에서 프로필 마크업, 페이퍼 마크업, bold 태그를 찾아서 변환하는 함수
function renderContentWithMarkup(content: string, memberIds: string[], alumniIds: string[], newsIndex: number, lineIndex: number): React.ReactNode {
  if (!content) return content;
  
  const isValidProfileId = (id: string) => memberIds.includes(id) || alumniIds.includes(id);
  const isAlumniProfile = (id: string) => alumniIds.includes(id);

  // <profile=ID>이름</>, <paper>제목</>, <b>텍스트</b> 패턴을 찾는 정규식
  const profilePattern = /<profile=([^>]+)>([^<]+)<\/>/g;
  const paperPattern = /<paper>([^<]+)<\/>/g;
  const boldPattern = /<b>([^<]+)<\/b>/g;
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const allMatches: Array<{type: 'profile' | 'paper' | 'bold', match: RegExpExecArray, index: number}> = [];
  
  // 프로필 매치 찾기
  let profileMatch;
  while ((profileMatch = profilePattern.exec(content)) !== null) {
    allMatches.push({
      type: 'profile',
      match: profileMatch,
      index: profileMatch.index
    });
  }
  
  // 페이퍼 매치 찾기
  let paperMatch;
  while ((paperMatch = paperPattern.exec(content)) !== null) {
    allMatches.push({
      type: 'paper',
      match: paperMatch,
      index: paperMatch.index
    });
  }
  
  // bold 매치 찾기
  let boldMatch;
  while ((boldMatch = boldPattern.exec(content)) !== null) {
    allMatches.push({
      type: 'bold',
      match: boldMatch,
      index: boldMatch.index
    });
  }
  
  // 인덱스 순으로 정렬
  allMatches.sort((a, b) => a.index - b.index);
  
  // 각 매치를 순서대로 처리
  allMatches.forEach((matchInfo) => {
    const { type, match, index } = matchInfo;
    
    // 매치 이전의 텍스트
    if (index > lastIndex) {
      const beforeText = content.substring(lastIndex, index);
      if (beforeText) {
        elements.push(
          <span key={`${newsIndex}-${lineIndex}-text-${lastIndex}`}>
            {beforeText}
          </span>
        );
      }
    }
    
    if (type === 'profile') {
      const [fullMatch, profileId, displayName] = match;
      
      if (isValidProfileId(profileId)) {
        const basePath = isAlumniProfile(profileId) ? '/people/alumni' : '/people/members';
        
        elements.push(
          <Link 
            key={`${newsIndex}-${lineIndex}-profile-${profileId}`}
            href={`${basePath}?id=${profileId.replace(/\s/g, '%20')}`}
            className="group underline-offset-4 hover:underline hover:decoration-1"
            title={`View ${displayName}`}
          >
            {displayName}
            <svg className="w-[0.66em] h-[0.66em] ml-0.5 inline opacity-60 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          </Link>
        );
      } else {
        // 프로필이 없으면 경고를 띄우고 강조 표시
        console.warn(`⚠️ Profile not found for ID: "${profileId}"`);
        elements.push(
          <span 
            key={`${newsIndex}-${lineIndex}-missing-${profileId}`} 
            className="text-red-500"
            title={`Profile not found: ${profileId}`}
          >
            {displayName}
          </span>
        );
      }
      
      lastIndex = index + fullMatch.length;
    } else if (type === 'paper') {
      const [fullMatch, paperTitle] = match;
      
      // 페이퍼 제목을 링크로 변환 (ProfileCardDetail과 동일한 스타일)
      elements.push(
        <Link 
          key={`${newsIndex}-${lineIndex}-paper-${index}`}
          href="https://bkoh509.github.io"
          className="hover:text-interactive-hover hover:underline underline-offset-4"
          title="View publication details"
        >
          {paperTitle}
        </Link>
      );
      
      lastIndex = index + fullMatch.length;
    } else if (type === 'bold') {
      const [fullMatch, boldText] = match;
      
      // bold 텍스트를 <strong> 태그로 변환
      elements.push(
        <strong 
          key={`${newsIndex}-${lineIndex}-bold-${index}`}
          className="font-semibold"
        >
          {boldText}
        </strong>
      );
      
      lastIndex = index + fullMatch.length;
    }
  });

  // 마지막 매치 이후의 텍스트
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      elements.push(
        <span key={`${newsIndex}-${lineIndex}-text-${lastIndex}`}>
          {remainingText}
        </span>
      );
    }
  }

  // 매치가 없으면 원본 텍스트 반환
  if (elements.length === 0) {
    return content;
  }

  return <>{elements}</>;
}

export function NewsList({ className = '', count = null, newsItems = [], memberIds = [], alumniIds = [], filterType = 'All', showFilters = false }: NewsListProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<NewsType>>(new Set(['All']));
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set());
  const [selectedYearPeriod, setSelectedYearPeriod] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  
  // newsItems가 전달되면 사용, 없으면 빈 배열 사용
  let newsData = newsItems;
  
  if (showFilters) {
    // 타입 필터링
    if (selectedTypes.has('All')) {
      // All이 선택된 경우 모든 뉴스 표시
      newsData = newsItems;
    } else {
      // 선택된 타입들만 필터링
      newsData = newsItems.filter(news => selectedTypes.has(news.type as NewsType));
    }
    
    // 연도 필터링 (해당 연도부터)
    if (selectedYears.size > 0) {
      const minYear = Math.min(...Array.from(selectedYears));
      newsData = newsData.filter(news => {
        const year = new Date(news.date).getFullYear();
        return year >= minYear;
      });
    }
  } else {
    if (filterType !== 'All') {
      newsData = newsData.filter(news => news.type === filterType);
    }
  }
  
  const latestNews = count ? newsData.slice(0, count) : newsData;
  
  // 필터 변경 핸들러
  const handleFilterTypeChange = (type: NewsType) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      
      if (type === 'All') {
        // All을 클릭한 경우: All만 선택하고 나머지 모두 해제
        return new Set(['All']);
      } else {
        // 개별 타입을 클릭한 경우
        if (newSet.has('All')) {
          // All이 선택되어 있으면 All을 제거하고 해당 타입만 선택
          newSet.delete('All');
          newSet.add(type);
        } else {
          // All이 선택되어 있지 않으면 토글
          if (newSet.has(type)) {
            newSet.delete(type);
            // 모든 개별 타입이 해제되면 All 선택
            if (newSet.size === 0) {
              newSet.add('All');
            }
          } else {
            newSet.add(type);
          }
        }
      }
      
      return newSet;
    });
  };

  // 연도 기간 선택 핸들러
  const handleYearPeriodChange = (value: string) => {
    setSelectedYearPeriod(value);
    setIsDropdownOpen(false);
    
    if (value === '') {
      setSelectedYears(new Set());
    } else {
      const currentYear = new Date().getFullYear();
      const years = parseInt(value);
      const fromYear = currentYear - years + 1;
      
      // 해당 기간의 모든 연도를 selectedYears에 추가
      const yearSet = new Set<number>();
      for (let year = fromYear; year <= currentYear; year++) {
        yearSet.add(year);
      }
      setSelectedYears(yearSet);
    }
  };

  // 드롭다운 옵션들
  const periodOptions = [
    { value: '', label: 'All' },
    { value: '1', label: '1 year' },
    { value: '2', label: '2 years' },
    { value: '3', label: '3 years' },
    { value: '5', label: '5 years' }
  ];

  const selectedOption = periodOptions.find(option => option.value === selectedYearPeriod) || periodOptions[0];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className={`${className}`}>
      {showFilters && (
        // Controls + News Count
        <div className="mb-8 md:mb-14 space-y-3 text-sm md:text-base font-normal">
          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 md:px-6 md:py-4 shadow-sm flex items-center gap-x-10 gap-y-2 md:gap-y-3 flex-wrap font-medium">
            {/* (1) Type Filter */}
            <div className="flex items-center gap-x-1 gap-y-1 pl-0 flex-wrap">
              <span className="text-gray-700 min-w-[50px] md:min-w-[0px] md:pr-2 flex-shrink-0">Categories:</span>
              <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
                {NEWS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFilterTypeChange(type)}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md transition-all duration-200 ${
                      selectedTypes.has(type)
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* (2) Recent Filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <label
                className="text-gray-700 min-w-[50px] md:min-w-[0px] md:pr-2 flex-shrink-0"
              >
                Recent:
              </label>

              {/* chip group 컨테이너: Type과 동일 */}
              <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
                {/* 커스텀 드롭다운 */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-2 md:px-3 py-1 md:py-1.5 rounded-md
                              transition-all duration-200
                              bg-white border border-transparent
                              hover:bg-gray-50
                              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
                              min-w-[100px] flex items-center justify-between gap-2"
                  >
                    <span>{selectedOption.label}</span>
                    <svg
                      className={`absolute right-1.5 h-5 w-5 text-gray-500 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                    </svg>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {periodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleYearPeriodChange(option.value)}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                            selectedYearPeriod === option.value
                              ? 'bg-brand-primary text-white hover:bg-brand-primary'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedYearPeriod && (
                  <button
                    type="button"
                    onClick={() => handleYearPeriodChange('')}
                    className="ml-1 px-2 md:px-3 py-1 md:py-1.5 rounded-md
                              text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
                    title="Clear recent filter"
                    aria-label="Clear recent filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* News Count */}
          <div className="mx-2 md:mx-4">
            <div className="text-base md:text-lg flex items-center gap-3">
              <span>
                Total <span className="font-semibold text-gray-900">{newsData.length}</span> of <span className="font-semibold text-gray-900">{newsItems.length}</span> news
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[auto,1fr] gap-x-[0.5em] md:gap-x-[0.6em] gap-y-[0.4em] md:gap-y-[0.6em]">
        {latestNews.map((news, idx) => {
          const date = new Date(news.date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const formattedDate = `${year}.${month}`;

          const lines = news.content.split('\n').filter(line => line.trim() !== '');
          const title = lines[0];
          const descriptionLines = lines.slice(1);

          return (
            <div key={`${news.date}-${idx}`} className="contents leading-snug">
              <div className="flex justify-center items-start -mt-0.5">
                <div className="relative">
                  <span className="text-[0.8em] font-semibold bg-gray-100 px-[0.6em] py-[0.3em] rounded">
                    {formattedDate}
                  </span>
                  {isNewItem(news.date) && (
                    <span className="absolute -top-[0.65em] -left-1 text-[0.7em] font-semibold text-red-500 transform -rotate-12 inline-flex">
                      <span className="animate-pulse" style={{animationDelay: '0ms'}}>N</span>
                      <span className="animate-pulse" style={{animationDelay: '100ms'}}>e</span>
                      <span className="animate-pulse" style={{animationDelay: '200ms'}}>w</span>
                    </span>
                  )}
                </div>
              </div>
              <div className={`${idx < latestNews.length - 1 ? 'border-b border-gray-200 pt-0.5 pb-2.5' : ''}`}>
                <div className="text-[0.95em] sm:text-[1em]">
                  {renderContentWithMarkup(title, memberIds, alumniIds, idx, 0)}
                </div>
                {descriptionLines.length > 0 && (
                  <div className="text-[0.9em] italic text-gray-600 mt-1 space-y-1.5">
                    {(() => {
                      const elements: React.ReactNode[] = [];
                      let currentBulletGroup: React.ReactNode[] = [];
                      let isInBulletGroup = false;
                      
                      descriptionLines.forEach((line, lineIdx) => {
                        const trimmedLine = line.trim();
                        const isBulletPoint = trimmedLine.startsWith('-');
                        const content = isBulletPoint ? trimmedLine.substring(1).trim() : trimmedLine;
                        
                        if (isBulletPoint) {
                          // 새로운 bullet point 시작
                          if (isInBulletGroup && currentBulletGroup.length > 0) {
                            // 이전 bullet group 완성
                            elements.push(
                              <div key={`bullet-group-${lineIdx}`} className="ml-0">
                                {currentBulletGroup}
                              </div>
                            );
                          }
                          // 새로운 bullet group 시작
                          currentBulletGroup = [];
                          isInBulletGroup = true;
                          
                          currentBulletGroup.push(
                            <div key={lineIdx} className="flex items-start gap-2 not-italic font-medium">
                              -
                              <div className="flex-1">
                                {renderContentWithMarkup(content, memberIds, alumniIds, idx, lineIdx + 1)}
                              </div>
                            </div>
                          );
                        } else {
                          if (isInBulletGroup) {
                            // bullet group 내의 일반 텍스트 (같은 indentation)
                            currentBulletGroup.push(
                              <div key={lineIdx} className="ml-4 text-[0.95em]">
                                {renderContentWithMarkup(content, memberIds, alumniIds, idx, lineIdx + 1)}
                              </div>
                            );
                          } else {
                            // bullet group 밖의 일반 텍스트
                            elements.push(
                              <div key={lineIdx}>
                                {renderContentWithMarkup(content, memberIds, alumniIds, idx, lineIdx + 1)}
                              </div>
                            );
                          }
                        }
                      });
                      
                      // 마지막 bullet group 처리
                      if (isInBulletGroup && currentBulletGroup.length > 0) {
                        elements.push(
                          <div key="bullet-group-final" className="ml-0">
                            {currentBulletGroup}
                          </div>
                        );
                      }
                      
                      return elements;
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

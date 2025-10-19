import React from 'react';
import Link from 'next/link';
import { NewsData } from '@/data/loaders/types';

export interface NewsListProps {
  className?: string
  count?: number | null
  newsItems?: NewsData[]
  memberIds?: string[]
  alumniIds?: string[]
}

// check if an item is new (within 3 months)
function isNewItem(date?: string): boolean {
  if (!date) return false;
  const itemDate = new Date(date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
  return itemDate >= sixMonthsAgo;
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
  
  // 모든 패턴을 찾아서 정렬
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

export function NewsList({ className = '', count = null, newsItems = [], memberIds = [], alumniIds = [] }: NewsListProps) {
  // newsItems가 전달되면 사용, 없으면 빈 배열 사용
  const newsData = newsItems;
  const latestNews = count ? newsData.slice(0, count) : newsData;

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-[auto,1fr] gap-x-[0.5em] gap-y-[0.4em]">
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

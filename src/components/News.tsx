import React from 'react';
import Link from 'next/link';
import { NewsData, ProfileData } from '@/data/loaders/types';

export interface NewsListProps {
  className?: string
  count?: number | null
  newsItems?: NewsData[]  // 외부에서 데이터를 전달받을 수 있도록 추가
  profiles?: ProfileData[]  // 현재 멤버 프로필 데이터
  alumniProfiles?: ProfileData[]  // 졸업생 프로필 데이터
}

// check if an item is new (within 3 months)
function isNewItem(date?: string): boolean {
  if (!date) return false;
  const itemDate = new Date(date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 3);
  return itemDate >= sixMonthsAgo;
}

// 텍스트에서 프로필 마크업을 찾아서 링크로 변환하는 함수
function renderContentWithProfileLinks(content: string, profiles: any[], alumniProfiles: any[], newsIndex: number, lineIndex: number): React.ReactNode {
  if (!content) return content;
  
  // 프로필 ID로 프로필을 찾는 함수 (현재 멤버와 alumni 모두에서 찾기)
  const findProfileById = (id: string) => {
    return profiles.find(profile => profile.id === id) || alumniProfiles.find(profile => profile.id === id);
  };

  // <profile=ID>이름</> 패턴을 찾는 정규식
  const profilePattern = /<profile=([^>]+)>([^<]+)<\/>/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = profilePattern.exec(content)) !== null) {
    const [fullMatch, profileId, displayName] = match;
    const matchStart = match.index;
    const matchEnd = match.index + fullMatch.length;

    // 매치 이전의 텍스트
    if (matchStart > lastIndex) {
      const beforeText = content.substring(lastIndex, matchStart);
      if (beforeText) {
        elements.push(
          <span key={`${newsIndex}-${lineIndex}-text-${lastIndex}`}>
            {beforeText}
          </span>
        );
      }
    }

    // 프로필 찾기
    const profile = findProfileById(profileId);
    
    if (profile) {
      // alumni 프로필인지 확인해서 적절한 경로 설정
      const isAlumniProfile = alumniProfiles.some(p => p.id === profileId);
      const basePath = isAlumniProfile ? '/people/alumni' : '/people/members';
      
      // 프로필이 있으면 링크로 변환
      elements.push(
        <Link 
          key={`${newsIndex}-${lineIndex}-profile-${profileId}`}
          href={`${basePath}?id=${profileId.replace(/\s/g, '%20')}`}
          className="group text-brand-primary underline-offset-4 hover:underline hover:decoration-1"
          title={`View ${profile.name_en} (${profile.name_ko})`}
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

    lastIndex = matchEnd;
  }

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

export function NewsList({ className = '', count = null, newsItems = [], profiles = [], alumniProfiles = [] }: NewsListProps) {
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

          const [title, ...description] = news.content.split('\n');
          const descriptionText = description.length > 0 ? description.join(' ') : '';

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
              <div className={`${idx < latestNews.length - 1 ? 'border-b border-gray-200 pb-1 mb-1' : ''}`}>
                <div className="text-[0.95em] sm:text-[1em]">
                  {renderContentWithProfileLinks(title, profiles, alumniProfiles, idx, 0)}
                </div>
                {descriptionText && (
                  <div className="text-[0.9em] italic text-gray-600 mt-1">
                    {renderContentWithProfileLinks(descriptionText, profiles, alumniProfiles, idx, 1)}
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

import Link from 'next/link';
import { getProfiles } from '../../data/loaders/profileLoader';
import { getAlumniProfiles } from '../../data/loaders/profileLoader';
import { StudyData } from '../../data/loaders/types';
import { StudyHighlightWrapper } from './StudyHighlight';
export { getStudies } from '@/data/loaders/studyLoader';


export interface StudyListProps {
  className?: string
  count?: number | null
  studyItems?: StudyData[]
  profiles?: any[]
}

// check if a study is ongoing (no end date or end date is in the future)
function isOngoingStudy(endDate: string | null): boolean {
  if (!endDate) return true;
  const end = new Date(endDate);
  const now = new Date();
  return end > now;
}

// format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear().toString(); // 연도를 4 자리로
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

// parse description and apply highlight styling to <h>...</h> tags
function parseDescription(description: string): React.ReactNode {
  const parts = description.split(/(<h>.*?<\/h>)/g);
  
  return parts.map((part, index) => {
    const highlightMatch = part.match(/^<h>(.*?)<\/h>$/);
    if (highlightMatch) {
      return (
        <span key={index} className="underline-offset-2 underline decoration-1 font-medium">
          {highlightMatch[1]}
        </span>
      );
    }
    return part;
  });
}

// 영어 이름을 URL 친화적인 slug로 변환하는 함수
function createSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .trim();
}

// parse profile format and render with member link
function renderProfileWithLink(participant: string, profiles: any[], alumniProfiles: any[]): React.ReactNode {
  const profileMatch = participant.match(/^<profile=(.+?)>(.+?)<\/>$/);
  
  if (profileMatch) {
    const [, profileId, displayName] = profileMatch;
    // 현재 멤버와 alumni 모두에서 프로필 찾기
    const profile = profiles.find(p => p.id === profileId) || alumniProfiles.find(p => p.id === profileId);
    
    if (profile) {
      const nameSlug = createSlugFromName(profile.name_en);
      const isAlumniProfile = alumniProfiles.some(p => p.id === profileId);
      const basePath = isAlumniProfile ? '/people/alumni' : '/people/members';
      

      
      return (
        <Link 
          href={`${basePath}?slug=${nameSlug}&id=${encodeURIComponent(profileId)}`}
          className="underline-offset-4 hover:underline hover:decoration-1 hover:text-brand-primary hover:decoration-brand-primary hover:font-medium transition-all duration-200"
          title={`View ${profile.name_ko} (${profile.name_en})`}
        >
          <span className=" transition-colors [&:hover>svg]:text-brand-primary">
            {displayName}
            <svg className="w-3.5 h-3. ml-0.5 inline text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </Link>
      );
    } else {
      console.warn(`⚠️ Profile not found for ID: "${profileId}"`);
      return (
        <span 
          className="text-red-500"
          title={`Profile not found: ${profileId}`}
        >
          {displayName}
        </span>
      );
    }
  }
  
  return <span>{participant}</span>;
}

export async function StudyList({ className = '', count = null, studyItems, profiles }: StudyListProps) {
  const allProfiles = profiles || await getProfiles();
  
  // alumni 데이터 로드 시 에러 처리
  let alumniProfiles: any[] = [];
  try {
    alumniProfiles = await getAlumniProfiles();
  } catch (error) {
    console.error('Error loading alumni profiles:', error);
    alumniProfiles = [];
  }
  
  const studies = studyItems ? (count ? studyItems.slice(0, count) : studyItems) : [];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 md:gap-y-8 ${className}`}>
      {studies.map((study, _) => {
        const studyId = `study-${study.title.replace(/\s+/g, '-').toLowerCase()}`;
        
        return (
          <StudyHighlightWrapper key={study.title} studyId={studyId}>
            {/* Card Header */}
            <div className="p-3 sm:p-4 pb-0 flex-1">
              <div className="flex justify-between items-start gap-2 mb-2">
                {/* Title */}
                <div className="flex-1 min-w-0 relative">
                  {study.link ? (
                    <Link 
                      href={study.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-1 w-fit hover:text-brand-primary transition-all duration-200 underline-offset-4 hover:underline hover:decoration-2"
                      title="View study details"
                    >
                      <h3 className="text-[1.1em] font-bold text-gray-800 group-hover/link:text-brand-primary transition-colors line-clamp-2">
                        {study.title}
                      </h3>
                      <svg className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover/link:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  ) : (
                    <h3 className="text-[1.1em] font-bold text-gray-800 line-clamp-2">
                      {study.title}
                    </h3>
                  )}
                </div>
              </div>
              {/* Date Range */}
              <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                <span className="pt-0.5 text-[0.85em]">
                  {formatDate(study.start_date)}
                  {study.end_date ? ` ~ ${formatDate(study.end_date)}` : ' ~ '}
                </span>
                {isOngoingStudy(study.end_date) && (
                  <span className="text-[0.75em] font-semibold bg-green-100 text-brand-primary px-1 py-0 rounded">
                    NOW
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-500 text-[0.9em] leading-normal mb-1 line-clamp-3">
                {parseDescription(study.description)}
              </p>
            </div>
            
            {/* Card Footer */}
            <div className="px-3 sm:px-4 pb-2 pt-2 border-t border-gray-200 mt-auto">
              {/* Participants */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[0.85em] text-gray-500 leading-normal">
                    {study.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center">
                        {/* <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></span> */}
                        <span className="mr-2 flex-shrink-0"> - </span>
                        {renderProfileWithLink(participant, allProfiles || [], alumniProfiles)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </StudyHighlightWrapper>
        );
      })}
    </div>
  )
} 
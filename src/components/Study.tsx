import yaml from 'js-yaml'
import path from 'path';
import fs from 'fs/promises';
import Link from 'next/link';
import { getProfiles } from './Profile';

export interface StudyData {
  title: string
  start_date: string
  end_date: string | null
  profile_ids: string[]
  link?: string  // 스터디 링크 추가
}

export interface StudyListProps {
  className?: string
  count?: number | null
  studyItems?: StudyData[]
}

// check if a study is new (within 3 months)
function isNewStudy(startDate: string): boolean {
  const studyDate = new Date(startDate);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return studyDate > threeMonthsAgo;
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
  const year = date.getFullYear().toString().slice(-2); // 연도를 두 자리로
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}.${month}.${day}`;
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
function renderProfileWithLink(profileId: string, profiles: any[]): React.ReactNode {
  const profileMatch = profileId.match(/^<profile=(.+?)>(.+?)<\/>$/);
  
  if (profileMatch) {
    const [, profileId, displayName] = profileMatch;
    const profile = profiles.find(p => p.id === profileId);
    
    if (profile) {
      const nameSlug = createSlugFromName(profile.name_en);
      return (
        <Link 
          href={`/people/members?slug=${nameSlug}&id=${encodeURIComponent(profileId)}`}
          className="group hover:text-brand-primary underline-offset-4 hover:underline hover:decoration-1 transition-all duration-200"
          title={`View ${profile.name_ko} (${profile.name_en})`}
        >
          {displayName}
          <svg className="w-3.5 h-3 ml-0.5 inline text-gray-500 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
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
  
  return <span>{profileId}</span>;
}

// 스터디 데이터를 가져오는 함수
export async function getStudyItems(): Promise<StudyData[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'study.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  return yaml.load(yamlText) as StudyData[];
}

export async function StudyList({ className = '', count = null, studyItems }: StudyListProps) {
  const rawData = studyItems || await getStudyItems();
  const profiles = await getProfiles();
  const studies = count ? rawData.slice(0, count) : rawData;

  return (
    <div className={className}>
      {studies.map((study, idx) => (
        <div key={study.title} id={`study-${study.title.replace(/\s+/g, '-').toLowerCase()}`}>
          <div className="flex justify-between items-center gap-2 mb-1">
            {/* Title */}
            <div className="flex-1 min-w-0">
              {study.link ? (
                <Link 
                  href={study.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 w-fit hover:text-brand-primary underline-offset-4 hover:underline hover:decoration-1 transition-all duration-200"
                  title="View study details"
                >
                  <span className="sm:text-[1.05em] leading-snug font-semibold text-gray-800 group-hover:text-brand-primary transition-colors">
                    {study.title}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              ) : (
                <span className="sm:text-[1.05em] leading-snug font-semibold text-gray-800">
                  {study.title}
                </span>
              )}
            </div>
            
            {/* 기간 정보 */}
            <div className="text-[0.9em] text-gray-600 text-right flex-shrink-0 flex items-center gap-1">
              <span>
                {formatDate(study.start_date)}
                {study.end_date ? ` ~ ${formatDate(study.end_date)}` : ' ~ '}
              </span>
              {isOngoingStudy(study.end_date) && (
                <span className="text-[0.8em] font-semibold bg-green-100 text-brand-primary px-1 py-0.5 rounded">
                  진행중
                </span>
              )}
            </div>
          </div>
          
          {/* 참여자 정보 */}
            <div className="text-[0.9em] text-gray-600">
              <span className="text-gray-800">
                - {study.profile_ids.map((profileId, idx) => (
                  <span key={idx}>
                    {renderProfileWithLink(profileId, profiles)}
                    {idx < study.profile_ids.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </div>

          {/* Divider */}
          {idx < studies.length - 1 && (
            <div className="border-b border-gray-200 my-3"></div>
          )}
        </div>
      ))}
    </div>
  )
} 
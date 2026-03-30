import type { ReactNode } from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import { SeminarData } from '@/data/loaders/types';
import { getProfileBasePath } from '@/lib/utils';

export type SeminarListLayout = 'card' | 'list';

export interface SeminarListProps {
  className?: string;
  layout?: SeminarListLayout;
  count?: number | null;
  seminarItems?: SeminarData[];
  profiles?: { id: string; name_ko?: string; name_en?: string }[];
  alumniProfiles?: { id: string; name_ko?: string; name_en?: string }[];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
}

/** tag.topic 객체에서 라벨 배열 추출 (YAML { topic: { A, B } } → ['A','B']) */
function getTopicTags(item: SeminarData): string[] {
  const topic = item.tag?.topic;
  if (!topic || typeof topic !== 'object') return [];
  return Object.keys(topic).filter(Boolean);
}

/** tag.area 객체에서 라벨 배열 추출 */
function getAreaTags(item: SeminarData): string[] {
  const area = item.tag?.area;
  if (!area || typeof area !== 'object') return [];
  return Object.keys(area).filter(Boolean);
}

/** 최근 6개월 이내 세미나인지 (date 기준) */
function isNewSeminar(item: SeminarData): boolean {
  if (!item.date) return false;
  const seminarDate = new Date(item.date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return seminarDate >= sixMonthsAgo;
}

function renderPresenter(
  presenter: { ID: string; name: string },
  profiles: { id: string; name_ko?: string; name_en?: string }[] = [],
  alumniProfiles: { id: string; name_ko?: string; name_en?: string }[] = []
): ReactNode {
  const profile = profiles.find((p) => p.id === presenter.ID) ?? alumniProfiles.find((p) => p.id === presenter.ID);
  if (profile) {
    const basePath = getProfileBasePath(presenter.ID, profiles, alumniProfiles);
    if (!basePath) return <span className="text-gray-700">{presenter.name}</span>;
    const profileId = presenter.ID.replace(/\s/g, '%20');
    return (
      <Link
        href={`${basePath}?id=${profileId}`}
        className="underline-offset-4 hover:underline hover:decoration-1.5 hover:text-brand-primary hover:decoration-brand-primary transition-colors"
        title={profile.name_ko ?? profile.name_en}
      >
        <span className="inline-flex items-center gap-0.5">
          {presenter.name}
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </Link>
    );
  }
  return <span className="text-gray-700">{presenter.name}</span>;
}

export function SeminarList({
  className = '',
  layout = 'list',
  count = null,
  seminarItems = [],
  profiles = [],
  alumniProfiles = [],
}: SeminarListProps) {
  /** list일 때만 md 이상에서 가로형; card일 때는 항상 세로형 */
  const listMd = layout === 'list';
  const items = seminarItems.length
    ? count
      ? seminarItems.slice(0, count)
      : seminarItems
    : [];

  /** season 순서 유지하며 그룹화 (첫 그룹이 가장 최신) */
  const groups: { season: string; items: SeminarData[] }[] = [];
  for (const item of items) {
    const season = item.season?.trim() || '';
    if (groups.length > 0 && groups[groups.length - 1].season === season) {
      groups[groups.length - 1].items.push(item);
    } else {
      groups.push({ season, items: [item] });
    }
  }

  return (
    <div className={className}>
      {groups.map((group, groupIdx) => (
        <section className="mb-12 last:mb-0" key={group.season || groupIdx}>
          {groupIdx > 0 && group.season && (
            <SectionHeader title={group.season} size="small" className="first:mt-0" />
          )}
          <div className={`grid gap-4 md:gap-5 grid-cols-1 ${listMd ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {group.items.map((item, idx) => (
              <div
                key={`${item.date}-${item.title}-${idx}`}
                className={`flex flex-col bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 min-h-0 ${listMd ? 'md:py-4 md:flex-row md:items-center md:gap-5' : 'h-full gap-2 md:py-4 md:gap-3'}`}
              >
                <span
                  className={`text-[14px] md:text-[16px] font-medium text-gray-600 leading-snug tabular-nums shrink-0 text-center block ${listMd ? 'mb-0 md:w-20 md:text-right' : 'mb-0'}`}
                >
                  {formatDate(item.date)}
                </span>
                <div
                  className={`flex-1 min-w-0 flex flex-col min-h-0 ${listMd ? 'md:flex-row md:justify-start md:items-center gap-2 md:gap-4' : 'gap-2 md:gap-2'}`}
                >
                  <div
                    className={`min-w-0 flex flex-col items-center text-center ${listMd ? 'flex-1 md:items-start md:text-left' : 'flex-1 min-h-0 justify-center'}`}
                  >
                    <p className={`text-[16px] md:text-[18px] font-semibold text-gray-800 leading-snug ${listMd ? 'mb-0' : ''}`}>
                      {(() => {
                        const title = item.title ?? '';
                        const words = title.trim().split(/\s+/).filter(Boolean);
                        const isNew = isNewSeminar(item);
                        const newBadge = (
                          <span className="ml-1.5 text-xs font-bold text-red-500 inline-flex">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>N</span>
                            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>e</span>
                            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>w</span>
                          </span>
                        );
                        if (!isNew || words.length === 0) {
                          return <>{title}{isNew ? newBadge : null}</>;
                        }
                        const lastTwo = words.slice(-2).join(' ');
                        const rest = words.slice(0, -2).join(' ');
                        return (
                          <>
                            {rest && <>{rest}{' '}</>}
                            <span className="whitespace-nowrap">
                              {lastTwo}
                              {newBadge}
                            </span>
                          </>
                        );
                      })()}
                    </p>
                    {listMd && (getTopicTags(item).length > 0 || getAreaTags(item).length > 0) && (
                      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-1 md:mt-2 md:justify-start">
                        {getAreaTags(item).map((label) => (
                          <span key={`area-${label}`} className="inline-block text-gray-600 bg-gray-100 px-2 py-0.5 md:py-0.25 rounded-md shrink-0 text-[12.5px] md:text-[14.5px]">
                            {label}
                          </span>
                        ))}
                        {getTopicTags(item).map((label) => (
                          <span key={`topic-${label}`} className="inline-block text-brand-primary bg-brand-primary/10 px-2 py-0.5 md:py-0.25 rounded-md shrink-0 text-[12.5px] md:text-[14.5px]">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!listMd && (
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
                      {(getTopicTags(item).length > 0 || getAreaTags(item).length > 0) && (
                        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
                          {getAreaTags(item).map((label) => (
                            <span key={`area-${label}`} className="inline-block text-gray-600 bg-gray-100 px-2 py-0.5 md:py-0.25 rounded-md shrink-0 text-[12.5px] md:text-[14.5px]">
                              {label}
                            </span>
                          ))}
                          {getTopicTags(item).map((label) => (
                            <span key={`topic-${label}`} className="inline-block text-brand-primary bg-brand-primary/10 px-2 py-0.5 md:py-0.25 rounded-md shrink-0 text-[12.5px] md:text-[14.5px]">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-gray-600 shrink-0 pt-2 border-t border-gray-200 w-full ${listMd ? 'md:pt-0 md:border-t-0 md:w-auto md:justify-end' : 'md:pt-4'}`}
                  >
                    {item.Presenter && (
                      <span className="text-[14.5px] md:text-[16.5px] text-gray-600 leading-normal">{renderPresenter(item.Presenter, profiles, alumniProfiles)}</span>
                    )}
                    {item.Presenter && (
                      <span className="text-gray-600 select-none">·</span>
                    )}
                    {item.slide && item.slideExists !== false ? (
                      <Link
                        href={item.slide}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-3 py-1 text-[13px] md:text-[15px] hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow transition duration-200"
                      >
                        Slide
                      </Link>
                    ) : (
                      <span className="flex-shrink-0 px-3 py-1 text-[13px] md:text-[15px] text-red-600 border border-red-200 rounded" title="슬라이드 파일 없음">
                        Slide
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

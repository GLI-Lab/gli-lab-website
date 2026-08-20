"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import { SeminarData } from '@/data/loaders/types';
import { getProfileHref, getSeminarHashId } from '@/lib/utils';
import { renderSeminarDescription, renderSeminarTitle, type SeminarTitleBadge } from '@/lib/seminarTitle';

export type SeminarListLayout = 'card' | 'list';

export interface SeminarListProps {
  className?: string;
  layout?: SeminarListLayout;
  count?: number | null;
  seminarItems?: SeminarData[];
  profiles?: { id: string; yamlId?: string; name_ko?: string; name_en?: string }[];
  alumniProfiles?: { id: string; yamlId?: string; name_ko?: string; name_en?: string }[];
}

function getSeminarDateKey(dateValue: string): string | null {
  const match = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function getTodayDateKey(): string {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateValue: string): string {
  const dateKey = getSeminarDateKey(dateValue);
  if (!dateKey) return dateValue;
  const [year, month, day] = dateKey.split('-');
  return `${year}.${month}.${day}`;
}

function getSixMonthsAgoDateKey(): string {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const year = sixMonthsAgo.getFullYear().toString();
  const month = (sixMonthsAgo.getMonth() + 1).toString().padStart(2, '0');
  const day = sixMonthsAgo.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 오늘 이후 날짜인지 (YYYY-MM-DD 문자열 비교) */
function isFutureSeminar(item: SeminarData): boolean {
  const dateKey = getSeminarDateKey(item.date);
  if (!dateKey) return false;
  return dateKey > getTodayDateKey();
}

/** 최근 6개월 이내 세미나인지 (date 기준, 미래 날짜 제외) */
function isNewSeminar(item: SeminarData): boolean {
  if (!item.date || isFutureSeminar(item)) return false;
  const dateKey = getSeminarDateKey(item.date);
  if (!dateKey) return false;
  return dateKey >= getSixMonthsAgoDateKey();
}

function getSeminarTitleBadge(item: SeminarData): SeminarTitleBadge {
  if (isFutureSeminar(item)) return 'todo';
  if (isNewSeminar(item)) return 'new';
  return 'none';
}

function renderPresenter(
  presenter: { ID: string; name: string },
  profiles: { id: string; yamlId?: string; name_ko?: string; name_en?: string }[] = [],
  alumniProfiles: { id: string; yamlId?: string; name_ko?: string; name_en?: string }[] = []
): ReactNode {
  const profile = profiles.find((p) => p.yamlId === presenter.ID || p.id === presenter.ID) ?? alumniProfiles.find((p) => p.yamlId === presenter.ID || p.id === presenter.ID);
  if (profile) {
    const href = getProfileHref(presenter.ID, profiles, alumniProfiles);
    if (!href) return <span className="text-gray-700">{presenter.name}</span>;
    return (
      <Link
        href={href}
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
  const [highlightedSeminarId, setHighlightedSeminarId] = useState<string | null>(null);

  useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;

    const checkHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#seminar-')) {
        setHighlightedSeminarId(null);
        return;
      }

      const targetId = decodeURIComponent(hash.substring(1));
      setHighlightedSeminarId(targetId);

      if (highlightTimer) clearTimeout(highlightTimer);

      let attempts = 0;
      const maxAttempts = 10;
      const scrollToElement = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(scrollToElement);
        }
      };
      requestAnimationFrame(scrollToElement);

      highlightTimer = setTimeout(() => {
        setHighlightedSeminarId(null);
      }, 1500);
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      if (highlightTimer) clearTimeout(highlightTimer);
    };
  }, [seminarItems]);

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
          <div className={`grid gap-4 md:gap-x-5 md:gap-y-7 grid-cols-1 ${listMd ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {group.items.map((item, idx) => {
              const seminarId = getSeminarHashId(item.title ?? '');
              const isHighlighted = highlightedSeminarId === seminarId;
              return (
              <div
                key={`${item.date}-${item.title}-${idx}`}
                id={seminarId}
                className={`flex flex-col bg-white px-4 py-2 rounded-xl border shadow-sm hover:border-brand-primary hover:shadow-md transition-all duration-200 min-h-0 ${listMd ? 'md:py-4 md:flex-row md:items-center md:gap-6' : 'h-full gap-2 md:py-4 md:gap-4'} ${
                  isHighlighted
                    ? 'border-brand-primary bg-brand-primary/10 shadow-lg animate-pulse'
                    : 'border-gray-200'
                }`}
              >
                <span
                  className={`text-[14px] md:text-[16px] font-medium text-gray-600 leading-snug tabular-nums shrink-0 text-center block ${listMd ? 'mb-0 md:w-20 md:text-right' : 'mb-0'}`}
                >
                  {formatDate(item.date)}
                </span>
                <div
                  className={`flex-1 min-w-0 flex flex-col min-h-0 ${listMd ? 'md:flex-row md:justify-start md:items-center gap-2 md:gap-4' : 'gap-2 md:gap-3'}`}
                >
                  <div
                    className={`min-w-0 flex flex-col items-center text-center ${listMd ? 'flex-1 md:items-start md:text-left' : 'flex-1 min-h-0 justify-center'}`}
                  >
                    <p className={`text-[16px] md:text-[17.5px] font-semibold text-gray-800 leading-snug ${listMd ? 'mb-0' : `${item.description?.trim() ? '' : 'min-h-[2.75rem] md:min-h-[3.125rem] '}flex items-center justify-center`}`}>
                      <span>{renderSeminarTitle(item.title ?? '', getSeminarTitleBadge(item))}</span>
                    </p>
                    {item.description?.trim() && (
                      <p className={`text-[14.5px] md:text-[16px] text-gray-600 leading-snug mt-1 ${listMd ? 'md:mt-4' : 'mt-3 md:mt-4'}`}>
                        {renderSeminarDescription(item.description.trim())}
                      </p>
                    )}
                  </div>
                  {(() => {
                    const slideUrl = item.slide && item.slideExists !== false ? item.slide : null;
                    const hasSlide = Boolean(slideUrl);
                    return (
                      <div
                        className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600 shrink-0 pt-2 border-t border-gray-200 w-full ${listMd ? 'md:pt-0 md:border-t-0 md:w-auto md:justify-end' : 'md:pt-4 justify-center'} ${listMd ? (hasSlide ? 'justify-center' : 'justify-end') : ''}`}
                      >
                        {item.Presenter && (
                          <span className="text-[15px] md:text-[16.5px] text-gray-600 leading-normal">{renderPresenter(item.Presenter, profiles, alumniProfiles)}</span>
                        )}
                        {item.Presenter && hasSlide && (
                          <span className="text-gray-600 select-none">·</span>
                        )}
                        {slideUrl && (
                          <a
                            href={slideUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 px-3 py-1 text-[13.5px] md:text-[15px] hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 rounded shadow-sm hover:shadow transition duration-200"
                          >
                            Slide
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

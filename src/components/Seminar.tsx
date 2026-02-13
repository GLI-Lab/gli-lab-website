import type { ReactNode } from 'react';
import Link from 'next/link';
import { SeminarData } from '@/data/loaders/types';

export interface SeminarListProps {
  className?: string;
  count?: number | null;
  seminarItems?: SeminarData[];
  profiles?: { id: string; name_ko?: string; name_en?: string }[];
  alumniProfiles?: { id: string; name_ko?: string; name_en?: string }[];
  /** 'list' = 한 줄 리스트, 'card' = 카드 그리드 */
  variant?: 'list' | 'card';
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

function renderPresenter(
  presenter: { ID: string; name: string },
  profiles: { id: string; name_ko?: string; name_en?: string }[] = [],
  alumniProfiles: { id: string; name_ko?: string; name_en?: string }[] = []
): ReactNode {
  const profile = profiles.find((p) => p.id === presenter.ID) ?? alumniProfiles.find((p) => p.id === presenter.ID);
  if (profile) {
    const isAlumni = alumniProfiles.some((p) => p.id === presenter.ID);
    const basePath = isAlumni ? '/people/alumni' : '/people/members';
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
  count = null,
  seminarItems = [],
  profiles = [],
  alumniProfiles = [],
  variant = 'list',
}: SeminarListProps) {
  const items = seminarItems.length
    ? count
      ? seminarItems.slice(0, count)
      : seminarItems
    : [];

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
        {items.map((item, idx) => (
          <div
            key={`${item.date}-${item.title}-${idx}`}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <span className="text-[0.85em] text-gray-500 font-medium tabular-nums mb-1">
              {formatDate(item.date)}
            </span>
            <h3 className="text-[1.05em] font-bold text-gray-800 line-clamp-2 mb-3 flex-1">
              {item.title}
            </h3>
            {/* 하단 한 줄: 발표자 · Slide (가운데 정렬) */}
            <div className="mt-auto pt-2 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.9em] text-gray-600">
              {item.Presenter && (
                <span>{renderPresenter(item.Presenter, profiles, alumniProfiles)}</span>
              )}
              {item.Presenter && item.slide && (
                <span className="text-gray-300 select-none">·</span>
              )}
              {item.slide && (
                <Link
                  href={item.slide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1 text-xs md:text-sm bg-white border border-gray-700 hover:bg-gray-50 transition-colors rounded"
                >
                  Slide
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {items.map((item, idx) => (
        <div
          key={`${item.date}-${item.title}-${idx}`}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-gray-50/80 transition-colors first:rounded-t-lg last:rounded-b-lg"
        >
          <span className="text-[0.9em] text-gray-500 font-medium tabular-nums shrink-0">
            {formatDate(item.date)}
          </span>
          <span className="text-gray-800 font-medium flex-1 min-w-0">
            {item.title}
          </span>
          {item.Presenter && (
            <span className="text-[0.9em] text-gray-600 shrink-0">
              {renderPresenter(item.Presenter, profiles, alumniProfiles)}
            </span>
          )}
          {item.slide && (
            <Link
              href={item.slide}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-3 py-1 text-xs md:text-sm bg-white border border-gray-700 hover:bg-gray-50 transition-colors rounded"
            >
              Slide
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

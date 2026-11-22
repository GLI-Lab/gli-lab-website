'use client';

import { useMemo, useState } from 'react';

import { StarIcon } from '@/components/Profile/ProfileCaptainBadge';
import { ProfileHoverLink } from '@/components/Profile/ProfileHoverLink';
import type { ProfileLinkTarget } from '@/data/loaders/types';
import type { ProfileSection } from '@/lib/profileSlug';

/**
 * 멤버와 졸업생 전체를 한 표로 보여 주는 명단 (/people/directory).
 * 열 제목을 누르면 정렬되고, 전체 / 멤버 / 졸업생으로 걸러 볼 수 있다.
 * 교수는 어떤 열로 정렬해도 맨 위에 고정이고, 줄 바탕색이 조금 다르다.
 * 캡틴을 맡았던 사람은 Captain 열에 기간이 나오고, 이름의 호버 카드도 노란 바탕으로 뜬다 (ProfileHoverLink가 그린다).
 * 이름은 다른 페이지의 사람 이름과 같은 링크다(ProfileHoverLink): 밑줄이 있고, 포인터를 올리면 얼굴과 짧은 소개가 뜨며,
 * 누르면 그 사람의 프로필로 간다.
 * 데이터는 page(서버)가 넘겨 준다. 조회수는 여기서 보여 주지 않는다 (관리자 화면 /admin/views 에만 있다).
 */

export interface ProfileRosterLinks {
  homepage?: string;
  github?: string;
  linkedin?: string;
  scholar?: string;
  cv?: string;
}

export interface ProfileRosterRow {
  id: string;
  nameEn: string;
  nameKo: string;
  /** 멤버 목록과 졸업생 목록에 모두 있는 사람은 둘 다 들어 있다 (한 줄로 합쳐서 보여 준다).
      표에 열로 보이지는 않고, 위의 전체 / 멤버 / 졸업생 거르기에 쓴다 */
  sections: ProfileSection[];
  /** 직위·학기 (예: "M.S. Student (4학기)") */
  title: string;
  /** 교수인지. 교수는 어떤 열로 정렬해도 맨 위에 고정한다 */
  isFaculty: boolean;
  /** 입학 시기 (예: "2025.03"). 멤버와 졸업생 모두 값이 있으면 채운다. 없는 사람(교수, 인턴 등)은 빈 문자열 */
  admission: string;
  /** 합류·종료 시기 (예: "2024.06", "Current"). 없으면 빈 문자열 */
  joinedStart: string;
  joinedEnd: string;
  /** 캡틴을 맡은 기간 (예: "2026.07", "Current"). 맡은 적이 없으면 둘 다 빈 문자열 */
  captainStart: string;
  captainEnd: string;
  /** 현재 소속 (주로 졸업생의 진로. 예: "카이스트"). 없으면 빈 문자열 */
  affiliation: string;
  links: ProfileRosterLinks;
  /** 사이트의 멤버·졸업생 페이지에 나오는 순서 (작을수록 먼저). 직위 열의 정렬 기준으로 쓴다 */
  order: number;
  /** 이름 링크와 호버 카드에 쓰는 값 (`getProfileLinks()`가 만든 사전에서 꺼낸 것). 없으면 이름을 글자로만 그린다 */
  link: ProfileLinkTarget | null;
}

type Filter = 'all' | ProfileSection;
type SortKey = 'name' | 'position' | 'admission' | 'joined' | 'captain' | 'affiliation';
type Sort = { key: SortKey; direction: 'asc' | 'desc' };

const joinedLabel = (row: ProfileRosterRow) => [row.joinedStart, row.joinedEnd].filter(Boolean).join(' - ');

const captainLabel = (row: ProfileRosterRow) => [row.captainStart, row.captainEnd].filter(Boolean).join(' - ');

/** 지금 캡틴을 맡고 있는지 (끝이 "Current"). 사진 위 캡틴 배지(isActiveCaptain)와 같은 기준이다 */
const isCurrentCaptain = (row: ProfileRosterRow) => row.captainStart !== '' && row.captainEnd.toLowerCase() === 'current';

// 이름 링크의 모양. 논문 저자 이름(ProfileAuthorName)과 같다: 점선 밑줄, 포인터를 올리면 초록 실선
const NAME_LINK =
  'font-medium underline decoration-dotted decoration-gray-400 underline-offset-4 hover:text-brand-primary hover:decoration-solid hover:decoration-brand-primary transition-colors';

/**
 * Links 열의 아이콘. 그림과 색(회색 바탕, 호버 때 초록)은 목록형 프로필(ProfileListItem)의 링크 버튼과 같고,
 * 표의 줄 높이에 맞게 크기만 작다.
 * 아이콘마다 자리가 정해져 있다. 링크가 없는 사람도 그 자리를 비워 두어, 같은 종류의 아이콘이 위아래로 한 줄에 놓인다
 * (CV나 홈페이지가 없다고 GitHub 아이콘이 왼쪽으로 당겨지지 않는다).
 * solid: 면을 채운 아이콘인지 (아니면 선으로 그린 아이콘)
 */
const LINK_ICONS: { key: keyof ProfileRosterLinks; label: string; solid: boolean; path: string }[] = [
  {
    key: 'homepage',
    label: 'Homepage',
    solid: false,
    path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    key: 'cv',
    label: 'CV',
    solid: false,
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    key: 'github',
    label: 'GitHub',
    solid: true,
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    solid: true,
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    key: 'scholar',
    label: 'Google Scholar',
    solid: true,
    path: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  },
];

// 칸 안쪽 여백과 Links 아이콘 한 칸의 크기. 모바일에서는 넓은 화면보다 작다
const CELL = 'px-2 py-1.5 md:px-3 md:py-2';
const ICON_BOX = 'w-6 h-6 md:w-7 md:h-7';

/** 글자 비교. 빈 값은 정렬 방향과 상관없이 항상 아래로 보낸다 (빈칸이 맨 위를 차지하지 않게) */
function compareText(a: string, b: string, sign: number): number {
  if (a === b) return 0;
  if (a === '') return 1;
  if (b === '') return -1;
  return sign * a.localeCompare(b);
}

export function ProfileRosterTable({ rows }: { rows: ProfileRosterRow[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  // 처음에는 입학이 빠른 순서로 보여 준다: 교수(고정) → 입학 시기가 있는 사람(멤버·졸업생 구분 없이 빠른 순) → 값이 없는 사람들.
  // 값이 없는 사람들(입학 예정, 인턴 등)끼리는 사이트에 나오는 순서를 따른다.
  const [sort, setSort] = useState<Sort>({ key: 'admission', direction: 'asc' });

  const filters: { value: Filter; label: string; count: number }[] = useMemo(
    () => [
      { value: 'all', label: 'All', count: rows.length },
      { value: 'members', label: 'Members', count: rows.filter((row) => row.sections.includes('members')).length },
      { value: 'alumni', label: 'Alumni', count: rows.filter((row) => row.sections.includes('alumni')).length },
    ],
    [rows]
  );

  const visibleRows = useMemo(() => {
    const filtered = filter === 'all' ? rows : rows.filter((row) => row.sections.includes(filter));
    const sign = sort.direction === 'asc' ? 1 : -1;
    const compare = (a: ProfileRosterRow, b: ProfileRosterRow) => {
      switch (sort.key) {
        case 'name':
          return sign * a.nameEn.localeCompare(b.nameEn);
        case 'position':
          return sign * (a.order - b.order);
        case 'admission':
          return compareText(a.admission, b.admission, sign);
        case 'joined':
          return compareText(a.joinedStart, b.joinedStart, sign);
        case 'captain':
          return compareText(a.captainStart, b.captainStart, sign);
        case 'affiliation':
          return compareText(a.affiliation, b.affiliation, sign);
      }
    };
    // 교수는 어떤 열로, 어느 방향으로 정렬해도 맨 위에 고정한다.
    // 그다음은 고른 열의 값 순서이고, 값이 같으면 사이트 순서대로 둔다 (정렬할 때마다 순서가 흔들리지 않게)
    return [...filtered].sort(
      (a, b) => Number(b.isFaculty) - Number(a.isFaculty) || compare(a, b) || a.order - b.order
    );
  }, [rows, filter, sort]);

  const changeSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
    );
  };

  const sortableHeader = (key: SortKey, label: string) => {
    const active = sort.key === key;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`${CELL} font-medium whitespace-nowrap`}
      >
        <button
          type="button"
          onClick={() => changeSort(key)}
          className={`inline-flex items-center gap-1 hover:text-interactive-primary ${active ? 'text-interactive-primary' : ''}`}
        >
          {label}
          <span aria-hidden className="text-[10px] md:text-[11px] w-3">
            {active ? (sort.direction === 'asc' ? '▲' : '▼') : ''}
          </span>
        </button>
      </th>
    );
  };

  /** 값이 없는 칸은 옅은 줄표로 채운다 */
  const cellText = (value: string) => (value ? value : <span className="text-gray-400">-</span>);

  return (
    // 모바일에서는 글자·아이콘·칸 여백을 모두 한 단계 작게 한다. 열이 많아 표를 좌우로 밀어야 하므로, 한 화면에 더 많이 보이게 한다
    <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12 text-[13px] md:text-[16px]">
      <div className="mb-4">
        <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden" role="group" aria-label="Group filter">
          {filters.map(({ value, label, count }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`px-2.5 py-1 md:px-3 md:py-1.5 text-[13px] md:text-sm ${filter === value ? 'bg-interactive-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {label} <span className={filter === value ? 'opacity-80' : 'text-gray-500'}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 좁은 화면에서는 표가 이 상자 안에서 좌우로 밀린다 (페이지 전체가 밀리지 않게).
          모든 칸은 한 줄로 둔다(whitespace-nowrap). 칸을 좁혀 줄을 꺾으면 "Ph.D. Student (3학기)" 같은 직위가
          두세 줄로 갈라져 읽기 어렵고 줄 높이도 들쭉날쭉해진다. */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-gray-700 border-b border-gray-200">
            <tr>
              {sortableHeader('name', 'Name')}
              {sortableHeader('position', 'Position')}
              {sortableHeader('admission', 'Admission')}
              {sortableHeader('joined', 'Joined')}
              {sortableHeader('captain', 'Captain')}
              {sortableHeader('affiliation', 'Affiliation')}
              <th scope="col" className={`${CELL} font-medium`}>
                Links
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              // 교수 줄은 맨 위 고정이라는 것이 드러나게 바탕을 옅은 초록으로 칠하고, 아래 구분선도 초록빛으로 조금 진하게 긋는다
              <tr
                key={row.id}
                className={`border-b last:border-b-0 ${row.isFaculty ? 'border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10' : 'border-gray-100 hover:bg-gray-50'}`}
              >
                <td className={`${CELL} whitespace-nowrap`}>
                  {row.link ? (
                    <ProfileHoverLink profile={row.link} className={NAME_LINK}>
                      {row.nameEn}
                    </ProfileHoverLink>
                  ) : (
                    <span className="font-medium">{row.nameEn}</span>
                  )}
                  <span className="text-gray-600"> ({row.nameKo})</span>
                </td>
                <td className={`${CELL} whitespace-nowrap text-gray-700`}>{row.title}</td>
                <td className={`${CELL} whitespace-nowrap tabular-nums text-gray-700`}>{cellText(row.admission)}</td>
                <td className={`${CELL} whitespace-nowrap tabular-nums text-gray-700`}>{cellText(joinedLabel(row))}</td>
                <td className={`${CELL} whitespace-nowrap tabular-nums text-gray-700`}>
                  {/* 캡틴을 맡은 기간. 앞의 별은 사진 위 캡틴 배지와 같은 것으로, 지금 맡고 있으면 노란색이고 지난 캡틴은 회색이다.
                      inline-flex가 아니라 flex다: inline-flex는 별의 아래 끝을 글자 기준선에 맞추어, 글자가 옆 칸들보다 위로 올라간다 */}
                  {row.captainStart ? (
                    <span className="flex items-center gap-1">
                      <StarIcon
                        className={`flex-shrink-0 w-4 h-4 md:w-[18px] md:h-[18px] ${isCurrentCaptain(row) ? 'text-amber-500' : 'text-gray-300'}`}
                      />
                      {captainLabel(row)}
                    </span>
                  ) : (
                    cellText('')
                  )}
                </td>
                <td className={`${CELL} whitespace-nowrap text-gray-700`}>{cellText(row.affiliation)}</td>
                <td className={CELL}>
                  <div className="flex gap-1 md:gap-1.5">
                    {LINK_ICONS.map(({ key, label, solid, path }) =>
                      !row.links[key] ? (
                        // 링크가 없는 자리. 아이콘과 같은 크기로 비워 둔다
                        <span key={key} className={`flex-shrink-0 ${ICON_BOX}`} aria-hidden />
                      ) : (
                        <a
                          key={key}
                          href={row.links[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={label}
                          aria-label={`${row.nameEn}: ${label}`}
                          className={`flex-shrink-0 ${ICON_BOX} rounded-md bg-gray-100 text-gray-600 hover:bg-interactive-primary hover:text-white flex items-center justify-center transition-colors duration-200`}
                        >
                          {solid ? (
                            <svg className="w-[15px] h-[15px] md:w-[18px] md:h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path d={path} />
                            </svg>
                          ) : (
                            <svg className="w-[17px] h-[17px] md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
                            </svg>
                          )}
                        </a>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

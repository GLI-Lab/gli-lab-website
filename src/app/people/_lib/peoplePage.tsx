import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
import { countPageView } from '@/lib/viewStore';
import { ViewCountUpdate } from '@/components/ViewCount';
import {
  buildProfileAsPath,
  buildProfileListPath,
  findProfileById,
  getProfileOgImagePath,
  type ProfileSection,
} from '@/lib/profileSlug';
import { getAlumniProfiles, getProfiles } from '@/data/loaders';
import { loadProfilePageData } from '@/app/people/_lib/loadProfilePageData';
const SECTION_CONFIG = {
  members: {
    title: 'Members',
    description:
      'Faculty, graduate students, and undergraduate interns of the Graph & Language Intelligence Lab at Konkuk University',
    isAlumni: false,
    getProfiles: getProfiles,
  },
  alumni: {
    title: 'Alumni',
    description: 'Alumni of the Graph & Language Intelligence Lab at Konkuk University',
    isAlumni: true,
    getProfiles: getAlumniProfiles,
  },
} as const;

function resolveSlugParam(slug: string[] | undefined): string | undefined {
  return slug?.[0];
}

export async function generatePeopleStaticParams(section: ProfileSection) {
  const config = SECTION_CONFIG[section];
  const profiles = await config.getProfiles();
  return [{ slug: [] as string[] }, ...profiles.map((profile) => ({ slug: [profile.id] }))];
}

export async function generatePeopleMetadata(
  section: ProfileSection,
  params: Promise<{ slug?: string[] }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
): Promise<Metadata> {
  const config = SECTION_CONFIG[section];
  const profiles = await config.getProfiles();
  const { slug: slugSegments } = await params;
  const resolvedSearchParams = await searchParams;
  const view = (resolvedSearchParams.view as string | undefined) ?? 'card';

  const slugInUrl = resolveSlugParam(slugSegments);

  if (slugInUrl) {
    const selected = findProfileById(profiles, slugInUrl);
    if (selected) {
      // 제목: 이름만 쓴다 (" | GLI Lab"을 붙이지 않는다).
      // 설명: "과정(학기 정보 포함) | 시기". 재학생은 합류 시기, 졸업생은 재적 기간을 쓴다.
      // 예: "M.S. Student (4학기) | Joined 2024.06", "Undergraduate Student | 2024.06 - 2026.04"
      const period = config.isAlumni
        ? [selected.joined_start, selected.joined_end].filter(Boolean).join(' - ')
        : selected.joined_start && `Joined ${selected.joined_start}`;
      return getMetadata({
        title: `${selected.name_en} (${selected.name_ko})`,
        appendSiteTitle: false,
        description: [selected.title, period].filter(Boolean).join(' | '),
        asPath: buildProfileAsPath(section, selected.id, view === 'list' ? 'list' : undefined),
        ogImage: getProfileOgImagePath(selected.yamlId),
      });
    }
  }

  return getMetadata({
    title: config.title,
    description: config.description,
    asPath: buildProfileAsPath(section),
  });
}

interface PeoplePageProps {
  section: ProfileSection;
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function renderPeoplePage({ section, params, searchParams }: PeoplePageProps) {
  const config = SECTION_CONFIG[section];
  const { slug: slugSegments } = await params;
  const resolvedSearchParams = await searchParams;
  const viewParam = resolvedSearchParams.view as string | undefined;

  const listFallbackPath = buildProfileListPath(
    section,
    viewParam === 'list' ? { view: 'list' } : undefined
  );

  const slugInUrl = resolveSlugParam(slugSegments);
  const { profiles } = await loadProfilePageData(config.isAlumni);

  if (slugInUrl) {
    const profile = findProfileById(profiles, slugInUrl);
    if (!profile) {
      redirect(listFallbackPath);
    }
    // 프로필 주소에 대한 요청 1건을 조회 1회로 센다. 카드형·목록형(?view=list) 모두 같은 주소라 여기서 함께 잡힌다.
    // members/alumni를 나누지 않고 'profile' 하나로 센다 — 졸업해 목록이 바뀌어도 조회수가 이어진다.
    // 새 조회수는 기다리지 않고 Promise째로 넘긴다. 도착하면 프로필의 숫자가 바뀐다.
    return <ViewCountUpdate id={profile.id} count={countPageView('profile', profile.id)} />;
  }

  // ProfileCards는 layout에 고정 — slug·metadata만 page에서 처리
  return null;
}

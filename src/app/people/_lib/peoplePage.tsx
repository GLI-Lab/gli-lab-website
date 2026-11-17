import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
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
    description: 'Explore the members of GLI Lab',
    profileLabel: 'Member', // 개별 프로필 설명에 붙는 구분
    isAlumni: false,
    getProfiles: getProfiles,
  },
  alumni: {
    title: 'Alumni',
    description: 'Explore the alumni of GLI Lab',
    profileLabel: 'Alumni',
    isAlumni: true,
    getProfiles: getAlumniProfiles,
  },
} as const;

function resolveSlugParam(slug: string[] | undefined): string | undefined {
  return slug?.[0];
}

/**
 * role.title에서 괄호 표기(학기 등)를 뗀 과정 이름. 예: "M.S. Student (2학기)" → "M.S. Student"
 * OG 이미지(scripts/generate-og-images.js의 cleanRoleTitle)와 같은 표기를 쓴다.
 */
function getProgramName(roleTitle: string): string {
  return roleTitle.replace(/\s*\([^)]*\)\s*/g, '').trim();
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
      // 설명: "과정 | 구분". 예: "M.S. Student | Member"
      // 연구실 이름은 제목("이름 | GLI Lab")에 이미 있으므로 넣지 않는다.
      const program = getProgramName(selected.title);
      return getMetadata({
        title: `${selected.name_en} (${selected.name_ko})`,
        description: [program, config.profileLabel].filter(Boolean).join(' | '),
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

  if (slugInUrl && !findProfileById(profiles, slugInUrl)) {
    redirect(listFallbackPath);
  }

  // ProfileCards는 layout에 고정 — slug·metadata만 page에서 처리
  return null;
}

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
    isAlumni: false,
    getProfiles: getProfiles,
  },
  alumni: {
    title: 'Alumni',
    description: 'Explore the alumni of GLI Lab',
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
      return getMetadata({
        title: `${selected.name_en} (${selected.name_ko})`,
        description: `Explore the ${section === 'members' ? 'member' : 'alumni'} of GLI Lab`,
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

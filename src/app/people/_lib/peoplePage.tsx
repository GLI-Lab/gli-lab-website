import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
import { SubCover } from '@/components/Covers';
import { ProfileCards } from '@/components/Profile';
import {
  buildProfileAsPath,
  buildProfileListPath,
  DEFAULT_MEMBER_PROFILE_YAML_ID,
  findProfileById,
  getProfileOgImagePath,
  parseProfileColsParam,
  type ProfileSection,
} from '@/data/loaders/profileSlug';
import { getAlumniProfiles, getProfiles } from '@/data/loaders/profileLoader';
import { loadProfilePageData } from '@/app/people/_lib/loadProfilePageData';
import type { ProfileData } from '@/data/loaders/types';

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

function resolveSelectedProfile(
  section: ProfileSection,
  profiles: ProfileData[],
  slugInUrl?: string
): ProfileData | null {
  if (slugInUrl) {
    return findProfileById(profiles, slugInUrl) ?? null;
  }

  if (section === 'members') {
    return profiles.find((p) => p.yamlId === DEFAULT_MEMBER_PROFILE_YAML_ID) ?? profiles[0] ?? null;
  }

  return null;
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
  const colsParam = resolvedSearchParams.cols as string | undefined;

  const listFallbackPath = buildProfileListPath(
    section,
    viewParam === 'list' ? { view: 'list' } : undefined
  );

  const slugInUrl = resolveSlugParam(slugSegments);
  const { profiles, studies, papers, patents, projects } = await loadProfilePageData(config.isAlumni);

  if (slugInUrl && !findProfileById(profiles, slugInUrl)) {
    redirect(listFallbackPath);
  }

  const selectedProfile = resolveSelectedProfile(section, profiles, slugInUrl);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <SubCover title={config.title} pattern="diagonal-lines" colorVariant="sage" showBreadcrumb={false} />
      <ProfileCards
        profiles={profiles}
        selectedProfile={selectedProfile}
        activeSlug={slugInUrl ?? null}
        studies={studies}
        papers={papers}
        patents={patents}
        projects={projects}
        isAlumniPage={config.isAlumni}
        initialIsCardView={viewParam !== 'list'}
        initialCardColumns={parseProfileColsParam(colsParam)}
      />
    </div>
  );
}

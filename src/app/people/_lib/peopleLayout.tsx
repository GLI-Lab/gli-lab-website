import { Suspense } from 'react';

import { SubCover } from '@/components/Covers';
import { ProfileCards } from '@/components/Profile';
import { getAlumniProfiles, getProfiles } from '@/data/loaders';
import type { ProfileSection } from '@/lib/profileSlug';

import { loadProfilePageData } from './loadProfilePageData';

const SECTION_CONFIG = {
  members: {
    title: 'Members',
    pathname: '/people/members',
    isAlumni: false,
    getProfiles: getProfiles,
  },
  alumni: {
    title: 'Alumni',
    pathname: '/people/alumni',
    isAlumni: true,
    getProfiles: getAlumniProfiles,
  },
} as const;

function ProfileCardsFallback() {
  return (
    <div className="max-w-screen-1.5xl mx-auto px-3 sm:px-4 py-8 md:py-12" aria-hidden>
      <div className="space-y-10">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 2 }, (_, j) => (
                <div key={j} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function renderPeopleLayout(section: ProfileSection, children: React.ReactNode) {
  const config = SECTION_CONFIG[section];
  const { profiles, studies, papers, patents, projects, seminars } = await loadProfilePageData(config.isAlumni);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <SubCover
        title={config.title}
        pathname={config.pathname}
        pattern="diagonal-lines"
        colorVariant="sage"
        showBreadcrumb={false}
      />
      <Suspense fallback={<ProfileCardsFallback />}>
        <ProfileCards
          profiles={profiles}
          studies={studies}
          papers={papers}
          patents={patents}
          projects={projects}
          seminars={seminars}
          isAlumniPage={config.isAlumni}
        />
      </Suspense>
      {children}
    </div>
  );
}

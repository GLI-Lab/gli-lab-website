import { unstable_cache } from 'next/cache';

import { getAlumniProfiles, getProfiles } from '@/data/loaders/profileLoader';
import { getPapers } from '@/data/loaders/paperLoader';
import { getStudies } from '@/data/loaders/studyLoader';
import { getPatents } from '@/data/loaders/patentLoader';
import { getProjects } from '@/data/loaders/projectLoader';

async function loadProfilePageDataImpl(isAlumni: boolean) {
  console.log('[loadProfilePageData]', { isAlumni, at: new Date().toISOString() });
  const [profiles, studies, papers, patents, projects] = await Promise.all([
    isAlumni ? getAlumniProfiles() : getProfiles(),
    getStudies(),
    getPapers(),
    getPatents(),
    getProjects(),
  ]);

  return { profiles, studies, papers, patents, projects };
}

export async function loadProfilePageData(isAlumni: boolean) {
  const section = isAlumni ? 'alumni' : 'members';

  return unstable_cache(
    () => loadProfilePageDataImpl(isAlumni),
    ['profile-page-data', section],
    {
      revalidate: 3600,
      tags: ['profile-page-data', `profile-page-data-${section}`],
    }
  )();
}

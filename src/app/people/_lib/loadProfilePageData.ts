import { getAlumniProfiles, getProfiles } from '@/data/loaders/profileLoader';
import { getPapers } from '@/data/loaders/paperLoader';
import { getStudies } from '@/data/loaders/studyLoader';
import { getPatents } from '@/data/loaders/patentLoader';
import { getProjects } from '@/data/loaders/projectLoader';

export async function loadProfilePageData(isAlumni: boolean) {
  const [profiles, studies, papers, patents, projects] = await Promise.all([
    isAlumni ? getAlumniProfiles() : getProfiles(),
    getStudies(),
    getPapers(),
    getPatents(),
    getProjects(),
  ]);

  return { profiles, studies, papers, patents, projects };
}

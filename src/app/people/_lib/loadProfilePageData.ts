import {
  getAlumniProfiles,
  getPapers,
  getPatents,
  getProfiles,
  getProjects,
  getSeminars,
  getStudies,
} from '@/data/loaders';

export async function loadProfilePageData(isAlumni: boolean) {
  const [profiles, studies, papers, patents, projects, seminars] = await Promise.all([
    isAlumni ? getAlumniProfiles() : getProfiles(),
    getStudies(),
    getPapers(),
    getPatents(),
    getProjects(),
    getSeminars(),
  ]);

  return { profiles, studies, papers, patents, projects, seminars };
}

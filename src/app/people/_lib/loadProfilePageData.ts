import {
  getAlumniProfiles,
  getPapers,
  getPatents,
  getProfileLinks,
  getProfiles,
  getProjects,
  getSeminars,
  getStudies,
} from '@/data/loaders';

export async function loadProfilePageData(isAlumni: boolean) {
  const [profiles, studies, papers, patents, projects, seminars, profileLinks] = await Promise.all([
    isAlumni ? getAlumniProfiles() : getProfiles(),
    getStudies(),
    getPapers(),
    getPatents(),
    getProjects(),
    getSeminars(),
    getProfileLinks(),
  ]);

  return { profiles, studies, papers, patents, projects, seminars, profileLinks };
}

import { getAlumniProfiles, getProfiles } from '@/data/loaders/profileLoader';
import { getPapers } from '@/data/loaders/paperLoader';
import { getStudies } from '@/data/loaders/studyLoader';
import { getPatents } from '@/data/loaders/patentLoader';
import { getProjects } from '@/data/loaders/projectLoader';

export async function loadProfilePageData(isAlumni: boolean) {
  // 현재 프로필 카드를 선택할 때 마다, loadProfilePageData를 매번 실행함
  // 추후에 수정할 예정
  // console.log('[loadProfilePageData]', { isAlumni, at: new Date().toISOString() });
  const [profiles, studies, papers, patents, projects] = await Promise.all([
    isAlumni ? getAlumniProfiles() : getProfiles(),
    getStudies(),
    getPapers(),
    getPatents(),
    getProjects(),
  ]);

  return { profiles, studies, papers, patents, projects };
}

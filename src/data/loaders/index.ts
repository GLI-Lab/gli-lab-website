import { unstable_cache } from 'next/cache';

import { getNewsUncached } from './newsLoader';
import { getPapersUncached } from './paperLoader';
import { getPatentsUncached } from './patentLoader';
import { getProfilesUncached, getAlumniProfilesUncached } from './profileLoader';
import { getProjectsUncached } from './projectLoader';
import { getSeminarsUncached, type GetSeminarsOptions } from './seminarLoader';
import { getStudiesUncached } from './studyLoader';
import type { ProfileLinks } from './types';

const REVALIDATE_SECONDS = 3600;
const isDev = process.env.NODE_ENV === 'development';
/** 배포마다 바뀌면 Data Cache 엔트리가 새로 만들어짐 (Vercel: VERCEL_DEPLOYMENT_ID) */
const DEPLOY_CACHE_BUST =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_BUILD_ID ||
  'local';

function createCachedLoader<T>(key: string, loader: () => Promise<T>, tags: string[]): () => Promise<T> {
  // 개발 모드에서는 캐시를 우회해서 YAML 변경이 즉시 반영되도록
  if (isDev) {
    return loader;
  }
  return () =>
    unstable_cache(loader, [key, DEPLOY_CACHE_BUST], {
      revalidate: REVALIDATE_SECONDS,
      tags: ['loaders', ...tags],
    })();
}

const loadNews = createCachedLoader('news', getNewsUncached, ['news']);
const loadPapers = createCachedLoader('papers', getPapersUncached, ['papers']);
const loadPatents = createCachedLoader('patents', getPatentsUncached, ['patents']);
const loadStudies = createCachedLoader('studies', getStudiesUncached, ['studies']);
const loadProjects = createCachedLoader('projects', getProjectsUncached, ['projects']);
const loadSeminars = createCachedLoader('seminars', getSeminarsUncached, ['seminars']);
const loadProfiles = createCachedLoader('profiles-members', getProfilesUncached, ['profiles', 'profiles-members']);
const loadAlumniProfiles = createCachedLoader('profiles-alumni', getAlumniProfilesUncached, ['profiles', 'profiles-alumni']);

export const getNews = loadNews;
export const getPapers = loadPapers;
export const getPatents = loadPatents;
export const getStudies = loadStudies;
export const getProjects = loadProjects;
export const getProfiles = loadProfiles;
export const getAlumniProfiles = loadAlumniProfiles;

export async function getSeminars(options?: GetSeminarsOptions) {
  const all = await loadSeminars();
  const count = options?.count;
  return count !== undefined ? all.slice(0, count) : all;
}

export type { GetSeminarsOptions };

/**
 * 사람 ID(YAML id) → 프로필 상세 페이지 href 사전(`ProfileLinks`)을 만든다.
 *
 * 논문·특허·프로젝트·뉴스·세미나·스터디 페이지는 사람을 YAML `ID`로만 참조하므로,
 * 그 ID를 클릭 가능한 주소로 바꾸는 규칙을 여기 한 곳에서 처리하고 결과만 컴포넌트에 넘긴다.
 * 컴포넌트는 `getProfileHref(id, links)`(= `links[id]`)로 꺼내 쓰기만 한다.
 *
 * 규칙
 *   - 경로: members면 `/people/members/`, alumni면 `/people/alumni/`
 *   - slug: `ProfileData.id` (예: "2024-03-byungkook-oh", profileLoader가 yamlId + 영문 이름으로 생성)
 *   - 끝에 `/` (next.config의 trailingSlash: true에 맞춤)
 *   - 같은 사람이 양쪽에 있으면 members 우선. alumni를 먼저 넣고 members로 덮어써서 구현.
 *     (학부연구생 alumni가 현재 멤버로 계속 있는 경우가 실제로 있음)
 *
 * 입력(프로필 로더 결과)과 출력 예
 *   members: [{ yamlId: "[2024.03] 오병국", id: "2024-03-byungkook-oh", ... }]
 *   alumni:  [{ yamlId: "[2024.07] 지상준", id: "2024-07-sangjun-ji", ... }]
 *   → { "[2024.03] 오병국": "/people/members/2024-03-byungkook-oh/",
 *       "[2024.07] 지상준": "/people/alumni/2024-07-sangjun-ji/" }
 *
 * 프로필 로더(`getProfiles`, `getAlumniProfiles`)가 이미 unstable_cache로 캐시되므로 별도 캐시는 두지 않는다.
 */
export async function getProfileLinks(): Promise<ProfileLinks> {
  const [members, alumni] = await Promise.all([getProfiles(), getAlumniProfiles()]);
  const links: ProfileLinks = {};
  for (const profile of alumni) {
    if (profile.yamlId) links[profile.yamlId] = `/people/alumni/${profile.id}/`;
  }
  for (const profile of members) {
    if (profile.yamlId) links[profile.yamlId] = `/people/members/${profile.id}/`;
  }
  return links;
}

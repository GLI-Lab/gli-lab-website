import { unstable_cache } from 'next/cache';

import { getNewsUncached } from './newsLoader';
import { getPapersUncached } from './paperLoader';
import { getPatentsUncached } from './patentLoader';
import { getProfilesUncached, getAlumniProfilesUncached } from './profileLoader';
import { getProjectsUncached } from './projectLoader';
import { getSeminarsUncached, type GetSeminarsOptions } from './seminarLoader';
import { getStudiesUncached } from './studyLoader';

const REVALIDATE_SECONDS = 3600;

function createCachedLoader<T>(key: string, loader: () => Promise<T>, tags: string[]): () => Promise<T> {
  return () =>
    unstable_cache(loader, [key], {
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

/** YAML id 목록 (뉴스 마크업 링크용) */
export async function getMemberIds(): Promise<string[]> {
  const profiles = await getProfiles();
  return profiles.map((profile) => profile.yamlId).filter(Boolean);
}

export async function getAlumniIds(): Promise<string[]> {
  const profiles = await getAlumniProfiles();
  return profiles.map((profile) => profile.yamlId).filter(Boolean);
}

/** YAML id → URL slug (뉴스·출판물 등 링크용) */
export async function getProfileSlugByYamlId(): Promise<Record<string, string>> {
  const [members, alumni] = await Promise.all([getProfiles(), getAlumniProfiles()]);
  const map: Record<string, string> = {};
  for (const profile of [...members, ...alumni]) {
    map[profile.yamlId] = profile.id;
  }
  return map;
}

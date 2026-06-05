import type { ProfileData } from './types';

/** members 페이지 기본 선택 프로필 (YAML id) */
export const DEFAULT_MEMBER_PROFILE_YAML_ID = '[2024.03] 오병국';

/** 프로필 OG 이미지 경로 (members·alumni 공통, prebuild 생성 파일) */
export function getProfileOgImagePath(yamlId: string): string {
  return `/images/profiles-og/${yamlId}.webp`;
}

/** YAML id 접두사 `[YYYY.MM]` → `YYYY-MM` (항상 9자 고정) */
function yamlIdToDateSlug(yamlId: string): string {
  return yamlId.slice(1, 8).replace('.', '-');
}

/** 영문 이름 → slug (하이픈 제거 후 공백을 `-`로) */
function englishNameToSlug(nameEn: string): string {
  return nameEn
    .toLowerCase()
    .replace(/-/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join('-');
}

/**
 * YAML id + 영문 이름으로 URL slug 생성.
 * 예: "[2024.03] 오병국" + "Byungkook Oh" -> "2024-03-byungkook-oh"
 */
export function generateProfileSlug(yamlId: string, nameEn: string): string {
  return `${yamlIdToDateSlug(yamlId)}-${englishNameToSlug(nameEn)}`;
}

export function findProfileById(
  profiles: ProfileData[],
  idOrSlug: string
): ProfileData | undefined {
  return profiles.find((p) => p.id === idOrSlug || p.yamlId === idOrSlug);
}

/** YAML id 또는 slug로 프로필 URL query id(slug) 반환 */
export function resolveProfileUrlId(
  idOrYamlId: string,
  profiles: Array<Pick<ProfileData, 'id' | 'yamlId'>>
): string {
  const profile = profiles.find((p) => p.yamlId === idOrYamlId || p.id === idOrYamlId);
  return profile?.id ?? idOrYamlId;
}

export type ProfileSection = 'members' | 'alumni';

export function getProfileSectionBasePath(section: ProfileSection): `/people/${ProfileSection}` {
  return `/people/${section}`;
}

/** 프로필 상세 경로 (trailing slash 포함) */
export function buildProfilePath(
  section: ProfileSection,
  profileId: string,
  options?: { view?: 'list' }
): string {
  const path = `/people/${section}/${profileId}/`;
  if (options?.view === 'list') return `${path}?view=list`;
  return path;
}

/** 목록 페이지 경로 (trailing slash 포함) */
export function buildProfileListPath(
  section: ProfileSection,
  options?: { view?: 'list' }
): string {
  const path = `/people/${section}/`;
  if (options?.view === 'list') return `${path}?view=list`;
  return path;
}

/** 메타데이터/OG용 canonical path */
export function buildProfileAsPath(
  section: ProfileSection,
  profileId?: string,
  view?: string
): string {
  if (!profileId) return buildProfileListPath(section, view === 'list' ? { view: 'list' } : undefined);
  const path = `/people/${section}/${profileId}/`;
  if (view === 'list') return `${path}?view=list`;
  return path;
}

import type { PaperTitle } from '@/data/loaders/types';

export function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, '') // 특수문자 제거 (한글은 유지, 하이픈은 끝에 배치)
    .replace(/\s+/g, '-')                  // 공백을 하이픈으로
    .replace(/-+/g, '-')                   // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '');                // 앞뒤 하이픈 제거
}

export function isLocalizedPaperTitle(title: PaperTitle): title is { ko: string; en: string } {
  return typeof title === 'object' && title !== null && 'ko' in title;
}

export function getPaperTitleId(title: PaperTitle): string {
  return titleToId(isLocalizedPaperTitle(title) ? title.ko : title);
}

export function getPaperTitleKey(title: PaperTitle): string {
  return isLocalizedPaperTitle(title) ? `${title.ko}\n${title.en}` : title;
}

export function getSeminarHashId(title: string): string {
  return `seminar-${title.replace(/\s+/g, '-').toLowerCase()}`;
}

type ProfileIdSource = string | { id: string; yamlId?: string };

function hasProfileId(profiles: ProfileIdSource[], id: string): boolean {
  return profiles.some((profile) => {
    if (typeof profile === 'string') return profile === id;
    return profile.id === id || profile.yamlId === id;
  });
}

export function getProfileBasePath(
  id: string,
  memberProfiles: ProfileIdSource[],
  alumniProfiles: ProfileIdSource[]
): '/people/members' | '/people/alumni' | null {
  if (hasProfileId(memberProfiles, id)) return '/people/members';
  if (hasProfileId(alumniProfiles, id)) return '/people/alumni';
  return null;
}

function resolveProfileSlug(
  id: string,
  memberProfiles: ProfileIdSource[],
  alumniProfiles: ProfileIdSource[]
): string {
  for (const profiles of [memberProfiles, alumniProfiles]) {
    for (const profile of profiles) {
      if (typeof profile === 'string') {
        if (profile === id) return id;
      } else if (profile.id === id || profile.yamlId === id) {
        return profile.id;
      }
    }
  }
  return id;
}

/** 프로필 상세 페이지 href (trailing slash 포함) */
export function getProfileHref(
  id: string,
  memberProfiles: ProfileIdSource[],
  alumniProfiles: ProfileIdSource[],
  profileSlugByYamlId?: Record<string, string>
): string | null {
  const basePath = getProfileBasePath(id, memberProfiles, alumniProfiles);
  if (!basePath) return null;
  const slug = profileSlugByYamlId?.[id] ?? resolveProfileSlug(id, memberProfiles, alumniProfiles);
  return `${basePath}/${slug}/`;
}


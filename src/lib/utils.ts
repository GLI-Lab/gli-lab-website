export function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3-]/g, '') // 특수문자 제거 (한글은 유지, 하이픈은 끝에 배치)
    .replace(/\s+/g, '-')                  // 공백을 하이픈으로
    .replace(/-+/g, '-')                   // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '');                // 앞뒤 하이픈 제거
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


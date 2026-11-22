import type { Metadata } from 'next';

import { SubCover } from '@/components/Covers';
import { ProfileRosterTable, type ProfileRosterRow } from '@/components/Profile/ProfileRosterTable';
import { isMarkedTitleType } from '@/components/Profile/ProfileTitleMarker';
import { getAlumniProfiles, getProfileLinks, getProfiles } from '@/data/loaders';
import { getMetadata } from '@/lib/GetMetadata';
import type { ProfileSection } from '@/lib/profileSlug';

/**
 * 멤버와 졸업생 전체 명단 (표). 주소: /people/directory/  (메뉴 이름: Directory)
 *
 * 멤버 페이지(/people/members)와 졸업생 페이지(/people/alumni)는 각자의 layout이 카드·목록형 화면(ProfileCards)을 그린다.
 * 이 페이지는 그 둘의 바깥에 있어서 표만 보여 준다. 두 목록을 합쳐 한 사람을 한 줄로 만든다.
 *
 * 조회수는 보여 주지 않는다. 사람별 조회수 표는 관리자 화면(/admin/views)에만 있다.
 */

export const generateMetadata = async (): Promise<Metadata> => {
  return getMetadata({
    title: 'Directory',
    description:
      'Directory of all current members and alumni of the Graph & Language Intelligence Lab at Konkuk University',
    asPath: '/people/directory',
  });
};

/**
 * 직위 종류(type)의 순서. 멤버·졸업생 페이지가 사람을 묶어 보여 주는 순서(ProfileCards의 categories)와 같다.
 * Position 열의 정렬 기준이고, 다른 열로 정렬할 때 값이 같은 사람들 사이의 순서이기도 하다. 여기 없는 종류는 맨 뒤로 간다.
 * (표의 처음 순서는 입학 시기다. ProfileRosterTable 참고)
 */
const TYPE_ORDER = ['faculty', 'phd', 'phd-ms', 'ms', 'ims', 'researcher', 'intern'];

/** 값이 비어 있지 않은 첫 주소. 프로필 데이터의 링크는 배열이고, 빈 문자열이 섞여 있을 수 있다 */
function firstUrl(urls: string[] | undefined): string | undefined {
  return urls?.find((url) => url.trim() !== '');
}

export default async function DirectoryPage() {
  // profileLinks: 이름 링크와 호버 카드에 쓰는 값. 다른 페이지(논문·뉴스 등)의 사람 이름과 같은 사전이다.
  const [members, alumni, profileLinks] = await Promise.all([getProfiles(), getAlumniProfiles(), getProfileLinks()]);

  // 멤버가 먼저, 그 안에서는 직위 종류 순서대로. 같은 종류 안에서는 데이터에 적힌 순서를 따른다.
  const typeRank = (type: string) => {
    const rank = TYPE_ORDER.indexOf(type);
    return rank === -1 ? TYPE_ORDER.length : rank;
  };
  const ordered = [
    ...members.map((profile, index) => ({ profile, section: 'members' as ProfileSection, index })),
    ...alumni.map((profile, index) => ({ profile, section: 'alumni' as ProfileSection, index })),
  ].sort(
    (a, b) =>
      (a.section === b.section ? 0 : a.section === 'members' ? -1 : 1) ||
      typeRank(a.profile.type) - typeRank(b.profile.type) ||
      a.index - b.index
  );

  // 멤버 목록과 졸업생 목록에 모두 있는 사람(인턴을 마치고 대학원생으로 다시 들어온 경우 등)은 id가 같다.
  // 한 줄로 합치고, 이름·직위·기간은 먼저 나온 멤버 쪽 것을 쓴다 (profileLinks도 이런 사람은 멤버 주소로 잡는다).
  const rowsById = new Map<string, ProfileRosterRow>();
  for (const { profile, section } of ordered) {
    const existing = rowsById.get(profile.id);
    if (existing) {
      existing.sections.push(section);
      continue;
    }
    rowsById.set(profile.id, {
      id: profile.id,
      nameEn: profile.name_en,
      nameKo: profile.name_ko,
      sections: [section],
      title: profile.title,
      isFaculty: profile.type === 'faculty',
      titleMarked: isMarkedTitleType(profile.type),
      // 입학 시기는 멤버와 졸업생 모두 값이 있으면 넣는다 (대학원을 마친 졸업생도 입학 시기가 있다)
      admission: profile.admission ?? '',
      joinedStart: profile.joined_start ?? '',
      joinedEnd: profile.joined_end ?? '',
      // 캡틴을 맡은 기간. 맡은 적이 없으면 둘 다 빈 문자열
      captainStart: profile.captain?.start ?? '',
      captainEnd: profile.captain?.end ?? '',
      affiliation: profile.affiliation?.current?.trim() ?? '',
      links: {
        homepage: firstUrl(profile.homepage),
        github: firstUrl(profile.github),
        linkedin: firstUrl(profile.linkedin),
        scholar: firstUrl(profile.scholar),
        cv: profile.cv,
      },
      order: rowsById.size,
      link: profileLinks[profile.yamlId] ?? null,
    });
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      <SubCover
        title="Directory"
        pathname="/people/directory"
        pattern="diagonal-lines"
        colorVariant="sage"
        showBreadcrumb={false}
      />
      <ProfileRosterTable rows={[...rowsById.values()]} />
    </div>
  );
}

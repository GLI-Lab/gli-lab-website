import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { ViewCountsAdmin } from '@/components/Admin/ViewCountsAdmin';
import { getAlumniProfiles, getProfiles } from '@/data/loaders';
import { ADMIN_PASSWORD_MIN_LENGTH, getAdminPassword, isAdminAuthorization } from '@/lib/adminAuth';
import { readViewAdminData } from '@/lib/viewAdmin';
import { isViewDataset, type ViewAdminRow } from '@/lib/viewAdminShared';
import { CURRENT_DATASET, IS_DEV_SERVER } from '@/lib/viewStore';

/**
 * 관리자용 조회수 화면. 멤버·졸업생의 조회수를 한 표로 보고, 정렬·수정·초기화한다.
 *   - 주소: /admin/views/  (메뉴에는 연결하지 않는다)
 *   - 접근: 관리자 비밀번호가 필요하다. 로그인 창은 `src/proxy.ts`가 띄우고, 여기서 한 번 더 확인한다.
 *   - 이 화면을 여는 것은 조회수에 잡히지 않는다 (조회수는 프로필·앨범 주소의 page에서만 센다).
 *   - 데이터: 운영 숫자와 개발용 숫자 중 하나를 골라 본다 (?data=production | development).
 *     주소에 없으면 이 서버가 기록하는 쪽을 보여 준다. 배포된 사이트는 운영, 로컬 개발 서버는 개발용이다.
 *     두 숫자가 같은 Redis에 있어서 어느 쪽에서든 둘 다 볼 수 있다.
 * 갤러리 앨범의 조회수는 여기서 다루지 않는다.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'View counts | Admin',
  // 검색엔진이 수집하지 않게 한다 (비밀번호로 막혀 있지만 겹쳐 둔다)
  robots: { index: false, follow: false, nocache: true },
};

interface AdminViewsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminViewsPage({ searchParams }: AdminViewsPageProps) {
  if (!getAdminPassword()) {
    // 운영에서는 페이지가 없는 것처럼 답한다. 로컬 개발 서버에서만 무엇을 설정해야 하는지 알려 준다.
    if (!IS_DEV_SERVER) notFound();
    return (
      <div className="max-w-screen-md mx-auto px-4 pt-12">
        <h1 className="text-2xl font-medium mb-4">관리자 비밀번호가 설정되지 않았습니다</h1>
        <p className="leading-relaxed">
          <code>.env.local</code>에 <code>ADMIN_PASSWORD</code>를 {ADMIN_PASSWORD_MIN_LENGTH}자 이상으로 넣으면 이 화면이 열립니다.
          배포된 사이트에서 쓰려면 Vercel의 Environment Variables에도 같은 이름으로 추가해야 합니다.
        </p>
      </div>
    );
  }

  const requestHeaders = await headers();
  if (!isAdminAuthorization(requestHeaders.get('authorization'))) notFound();

  const { data: dataParam } = await searchParams;
  const dataset = isViewDataset(dataParam) ? dataParam : CURRENT_DATASET;

  const [data, members, alumni] = await Promise.all([
    readViewAdminData(dataset, 'profile'),
    getProfiles(),
    getAlumniProfiles(),
  ]);

  if (!data) {
    return (
      <div className="max-w-screen-md mx-auto px-4 pt-12">
        <h1 className="text-2xl font-medium mb-4">조회수 저장소를 읽지 못했습니다</h1>
        <p className="leading-relaxed">
          환경변수 <code>UPSTASH_REDIS_REST_URL</code>, <code>UPSTASH_REDIS_REST_TOKEN</code>이 설정되어 있는지 확인하고
          다시 열어 보세요.
        </p>
      </div>
    );
  }

  // 저장소에는 한 번이라도 열린 사람만 들어 있다. 프로필 목록과 합쳐, 열린 적 없는 사람은 0으로 표시한다.
  // 멤버 목록과 졸업생 목록에 모두 있는 사람은 id가 같고 조회수도 하나다. 한 줄로 합친다 (이름·직위는 멤버 쪽 것을 쓴다).
  const rowsById = new Map<string, ViewAdminRow>();
  for (const { profile, section } of [
    ...members.map((profile) => ({ profile, section: 'members' as const })),
    ...alumni.map((profile) => ({ profile, section: 'alumni' as const })),
  ]) {
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
      count: data.counts[profile.id] ?? 0,
    });
  }
  const rows = [...rowsById.values()];

  // 프로필 목록에 없는 id의 조회수. 주소(id)가 바뀌면 예전 id의 숫자가 이렇게 남는다.
  const orphans: ViewAdminRow[] = Object.entries(data.counts)
    .filter(([id]) => !rowsById.has(id))
    .map(([id, count]) => ({ id, nameEn: '', nameKo: '', sections: [], title: '', count }));

  // key: 데이터를 바꾸면 열려 있던 입력칸·확인 창·알림을 버리고 새로 그린다 (다른 데이터에 대한 것이므로)
  return (
    <ViewCountsAdmin
      key={dataset}
      rows={rows}
      orphans={orphans}
      log={data.log}
      dataset={dataset}
      currentDataset={CURRENT_DATASET}
    />
  );
}

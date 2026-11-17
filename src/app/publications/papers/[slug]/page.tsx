import {
  generatePublicationItemMetadata,
  renderPublicationItemPage,
} from '@/app/publications/_lib/publicationPage';

// 개별 논문 주소는 빌드 때 미리 만들지 않고 요청 시 렌더링한다.
// 본문이 목록 페이지와 같고 <head>의 태그만 달라서, 미리 만들면 같은 내용의 복사본이 논문 수만큼 생긴다.
// 다른 방식과의 비교는 src/app/README.md의 6)에 있다.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  return generatePublicationItemMetadata('papers', params);
}

export default function Page({ params }: PageProps) {
  return renderPublicationItemPage('papers', params);
}

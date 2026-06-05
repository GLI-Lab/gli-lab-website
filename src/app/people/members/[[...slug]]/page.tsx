import {
  generatePeopleMetadata,
  generatePeopleStaticParams,
  renderPeoplePage,
} from '@/app/people/_lib/peoplePage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  return generatePeopleStaticParams('members');
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return generatePeopleMetadata('members', params, searchParams);
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page(props: PageProps) {
  return renderPeoplePage({ section: 'members', ...props });
}

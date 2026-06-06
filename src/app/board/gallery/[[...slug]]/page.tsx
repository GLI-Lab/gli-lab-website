import {
  generateGalleryMetadata,
  generateGalleryStaticParams,
  renderGalleryPage,
} from '@/app/board/gallery/_lib/galleryPage';

export const dynamic = 'force-dynamic';  // 즉각 업데이트 가능
export const revalidate = 0;

export async function generateStaticParams() {
  return generateGalleryStaticParams();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return generateGalleryMetadata(params, searchParams);
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function Page(props: PageProps) {
  return renderGalleryPage(props);
}

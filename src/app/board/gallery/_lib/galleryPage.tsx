import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
import { getGalleryItems } from '@/components/Gallery';
import {
  buildGalleryAsPath,
  findGalleryItemBySlug,
  GALLERY_BASE_PATH,
} from '@/components/Gallery/gallerySlug';

const TITLE = 'Gallery';

function resolveSlugParam(slug: string[] | undefined): string | undefined {
  return slug?.[0];
}

export async function generateGalleryStaticParams() {
  const items = await getGalleryItems();
  return [{ slug: [] as string[] }, ...items.map((item) => ({ slug: [item.slug] }))];
}

export async function generateGalleryMetadata(
  params: Promise<{ slug?: string[] }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
): Promise<Metadata> {
  const items = await getGalleryItems();
  const { slug: slugSegments } = await params;
  await searchParams;

  const slugInUrl = resolveSlugParam(slugSegments);
  if (slugInUrl) {
    const selected = findGalleryItemBySlug(items, slugInUrl);
    if (selected) {
      return getMetadata({
        title: `${selected.title}`,
        description: `Explore the photos of GLI Lab`,
        asPath: buildGalleryAsPath(selected.slug),
        // 공유 미리보기 이미지: 이 앨범의 첫 번째 사진
        ogImage: selected.thumbnail,
      });
    }
  }

  return getMetadata({
    title: TITLE,
    description:
      'Explore the photos of GLI Lab',
    asPath: buildGalleryAsPath(),
    // 목록 페이지: 가장 최근 앨범의 첫 번째 사진 (앨범이 없으면 기본 로고)
    ogImage: items[0]?.thumbnail,
  });
}

interface GalleryPageProps {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function renderGalleryPage({ params }: GalleryPageProps) {
  const { slug: slugSegments } = await params;
  const slugInUrl = resolveSlugParam(slugSegments);

  if (slugInUrl) {
    const galleryItems = await getGalleryItems();
    if (!findGalleryItemBySlug(galleryItems, slugInUrl)) {
      redirect(`${GALLERY_BASE_PATH}/`);
    }
  }

  return null;
}

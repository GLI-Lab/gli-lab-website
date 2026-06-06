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
        description: `Photo gallery: ${selected.title} - GLI Lab`,
        asPath: buildGalleryAsPath(selected.slug),
      });
    }
  }

  return getMetadata({
    title: TITLE,
    description:
      'Photo gallery and visual content from GLI Lab - Graph Learning and Intelligence Laboratory at Konkuk University',
    asPath: buildGalleryAsPath(),
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

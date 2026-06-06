import type { GalleryItem } from './types';

export const GALLERY_BASE_PATH = '/board/gallery';

/** config date → URL slug (예: "2025-07-03 ~ 2025-07-31" → "2025-07-03-2025-07-31") */
export function dateToGallerySlug(date?: string): string {
  if (!date) return '';
  const trimmed = date.trim();
  if (trimmed.includes('~')) {
    return trimmed
      .split('~')
      .map((part) => part.trim())
      .filter(Boolean)
      .join('-');
  }
  return trimmed;
}

export function findGalleryItemBySlug(
  items: GalleryItem[],
  slug: string
): GalleryItem | undefined {
  return items.find((item) => item.slug === slug);
}

/** 갤러리 경로 (trailing slash 포함) */
export function buildGalleryPath(
  slug?: string,
  options?: { detail?: boolean }
): string {
  const path = slug ? `${GALLERY_BASE_PATH}/${slug}/` : `${GALLERY_BASE_PATH}/`;
  if (options?.detail) return `${path}?detail=1`;
  return path;
}

/** 메타데이터/OG용 canonical path */
export function buildGalleryAsPath(slug?: string): string {
  return slug ? `${GALLERY_BASE_PATH}/${slug}/` : `${GALLERY_BASE_PATH}/`;
}

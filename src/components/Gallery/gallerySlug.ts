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

/**
 * 같은 날짜 폴더 접미사 (예: `260828-2` → `"2"`).
 * 기간 폴더 `260715-260819` 는 제외한다.
 */
export function galleryFolderSequence(folder: string): string | undefined {
  const match = folder.match(/^(\d{6}(?:-\d{6})?)-(\d{1,3})$/);
  return match?.[2];
}

/** date slug + 폴더 시퀀스 (예: 260828-2, date 2026-08-28 → "2026-08-28-2") */
export function toGallerySlug(date: string | undefined, folder: string): string {
  const base = dateToGallerySlug(date) || folder;
  const sequence = galleryFolderSequence(folder);
  return sequence ? `${base}-${sequence}` : base;
}

/** 동일 slug가 남으면 -2, -3 … 을 붙여 URL이 겹치지 않게 한다. */
export function uniquifyGallerySlugs<T extends { slug: string }>(items: T[]): T[] {
  const used = new Set<string>();
  for (const item of items) {
    if (!used.has(item.slug)) {
      used.add(item.slug);
      continue;
    }
    const base = item.slug;
    let n = 2;
    while (used.has(`${base}-${n}`)) n += 1;
    item.slug = `${base}-${n}`;
    used.add(item.slug);
  }
  return items;
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

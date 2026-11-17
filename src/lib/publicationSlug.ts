import { titleToId } from '@/lib/utils';

export const PAPERS_BASE_PATH = '/publications/papers';
export const PATENTS_BASE_PATH = '/publications/patents';

/**
 * 논문·특허 개별 항목의 주소 (trailing slash 포함).
 * id는 목록의 DOM id와 같은 값이다 (논문: getPaperTitleId, 특허: titleToId(title.ko)).
 * 한글 제목이면 id에 한글이 들어가므로 인코딩한다.
 *
 * @returns 예: "/publications/papers/temporal-knowledge-graph-forecasting/"
 */
export function buildPublicationPath(basePath: string, id: string): string {
  return `${basePath}/${encodeURIComponent(id)}/`;
}

/**
 * 주소의 slug를 목록의 id 형식으로 바꾼다.
 * slug는 인코딩된 채로 올 수 있고(%EA%B7%B8...), macOS에서 복사한 한글은 조합형(NFD)일 수 있다.
 */
export function slugToPublicationId(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // 잘못된 인코딩이면 받은 값 그대로 쓴다
  }
  return titleToId(decoded.normalize('NFC'));
}

/**
 * pathname에서 개별 항목의 id를 꺼낸다.
 * 목록 주소(예: /publications/papers/)이거나 다른 경로면 null.
 */
export function getPublicationIdFromPathname(pathname: string, basePath: string): string | null {
  const prefix = `${basePath}/`;
  if (!pathname.startsWith(prefix)) return null;

  const slug = pathname.slice(prefix.length).replace(/\/$/, '');
  if (!slug || slug.includes('/')) return null;

  return slugToPublicationId(slug) || null;
}

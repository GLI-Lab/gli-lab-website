import type { AuthorData, PaperData, PatentData } from '@/data/loaders/types';
import { getPaperTitleId, isLocalizedPaperTitle, titleToId } from '@/lib/utils';
import { buildPublicationPath, PAPERS_BASE_PATH, PATENTS_BASE_PATH } from '@/lib/publicationSlug';

export interface PublicationPreviewAuthor {
  name: string;
  /** 교신저자 (*) */
  isCorresponding?: boolean;
  /** 공동 1저자 (‡) */
  isEqualFirst?: boolean;
}

export interface PublicationPreviewVenue {
  name: string;
  acronym?: string;
  year: number;
  /** 논문 종류 (예: Findings Paper). Acceptance rate는 뺀다. */
  paperType?: string;
}

export interface PublicationPreview {
  href: string;
  title: string;
  subtitle?: string;
  authors: PublicationPreviewAuthor[];
  /** 게재가 확정된 논문의 학회·저널 정보. */
  venue?: PublicationPreviewVenue;
  /** 특허의 출원·등록 정보. 출원과 등록 사이에 줄바꿈(\n)이 들어간다. */
  meta: string;
  /** Accepted가 아니면 카드에 상태 뱃지로 보여 준다. */
  status?: string;
}

export interface PublicationPreviews {
  papers: Record<string, PublicationPreview>;
  patents: Record<string, PublicationPreview>;
}

function toPaperPreviewAuthors(authors: AuthorData[]): PublicationPreviewAuthor[] {
  const multipleFirst = authors.filter((author) => author.position === 'first').length > 1;
  return authors
    .map((author) => ({
      name: author.name.replace(/\([^)]*\)/g, '').trim(),
      isCorresponding: author.isCorresponding || undefined,
      isEqualFirst: (author.position === 'first' && multipleFirst) || undefined,
    }))
    .filter((author) => author.name);
}

/**
 * notes.normal에서 논문 종류만 남긴다.
 * "Findings Paper (Acceptance Rate: Findings 14.3% = …)" → "Findings Paper"
 */
function extractPaperType(note: string | undefined): string | undefined {
  if (!note) return undefined;
  const paperType = note
    .replace(/\s*\([^)]*Acceptance Rate[^)]*\)/gi, '')
    .replace(/Acceptance Rate:.*$/i, '')
    .replace(/[\s,;:—-]+$/, '')
    .trim();
  return paperType || undefined;
}

function formatPatentDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function paperToPreview(paper: PaperData): PublicationPreview {
  const venue =
    paper.status === 'Accepted' && paper.venue?.name && paper.year
      ? {
          name: paper.venue.name,
          acronym: paper.venue.acronym || undefined,
          year: paper.year,
          paperType: extractPaperType(paper.notes?.normal),
        }
      : undefined;
  const title = paper.title;

  return {
    href: buildPublicationPath(PAPERS_BASE_PATH, getPaperTitleId(title)),
    title: isLocalizedPaperTitle(title) ? title.ko : title,
    subtitle: isLocalizedPaperTitle(title) ? title.en : undefined,
    authors: toPaperPreviewAuthors(paper.authors ?? []),
    venue,
    meta: '',
    status: paper.status === 'Accepted' ? undefined : paper.status,
  };
}

export function patentToPreview(patent: PatentData): PublicationPreview {
  const filed = patent.status.filed;
  const registered = patent.status.registered;
  const parts: string[] = [];
  if (filed.date && filed.number) {
    parts.push(`출원번호 ${filed.number}, 출원일 ${formatPatentDate(filed.date)}`);
  }
  if (registered.date && registered.number) {
    parts.push(`등록번호 ${registered.number}, 등록일 ${formatPatentDate(registered.date)}`);
  }

  return {
    href: buildPublicationPath(PATENTS_BASE_PATH, titleToId(patent.title.ko)),
    title: patent.title.ko,
    subtitle: patent.title.en,
    authors: (patent.authors ?? []).filter((author) => author.name).map((author) => ({ name: author.name })),
    // 출원과 등록은 줄을 나눠 보여 준다 (카드에서 whitespace-pre-line).
    meta: parts.join(',\n'),
  };
}

export function buildPublicationPreviews(
  papers: PaperData[],
  patents: PatentData[],
): PublicationPreviews {
  const paperPreviews: Record<string, PublicationPreview> = {};
  for (const paper of papers) {
    paperPreviews[getPaperTitleId(paper.title)] = paperToPreview(paper);
  }

  const patentPreviews: Record<string, PublicationPreview> = {};
  for (const patent of patents) {
    patentPreviews[titleToId(patent.title.ko)] = patentToPreview(patent);
  }

  return { papers: paperPreviews, patents: patentPreviews };
}

import type { AuthorData, PaperData, PatentData } from '@/data/loaders/types';
import { getPaperTitleId, isLocalizedPaperTitle, titleToId } from '@/lib/utils';

export interface PublicationPreview {
  href: string;
  title: string;
  subtitle?: string;
  authors: string;
  meta: string;
  /** Accepted가 아니면 카드에 상태 뱃지로 보여 준다. */
  status?: string;
}

export interface PublicationPreviews {
  papers: Record<string, PublicationPreview>;
  patents: Record<string, PublicationPreview>;
}

function formatPaperAuthors(authors: AuthorData[]): string {
  const multipleFirst = authors.filter((author) => author.position === 'first').length > 1;
  return authors
    .map((author) => {
      let name = author.name.replace(/\([^)]*\)/g, '').trim();
      if (author.isCorresponding) name += '*';
      if (author.position === 'first' && multipleFirst) name += '‡';
      return name;
    })
    .filter(Boolean)
    .join(', ');
}

function formatPatentDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function paperToPreview(paper: PaperData): PublicationPreview {
  const venueName = paper.venue?.acronym
    ? `${paper.venue.name} (${paper.venue.acronym})`
    : paper.venue?.name;
  const meta =
    paper.status === 'Accepted' && venueName && paper.year ? `${venueName}, ${paper.year}` : '';
  const title = paper.title;

  return {
    href: `/publications/papers#${encodeURIComponent(getPaperTitleId(title))}`,
    title: isLocalizedPaperTitle(title) ? title.ko : title,
    subtitle: isLocalizedPaperTitle(title) ? title.en : undefined,
    authors: formatPaperAuthors(paper.authors ?? []),
    meta,
    status: paper.status === 'Accepted' ? undefined : paper.status,
  };
}

export function patentToPreview(patent: PatentData): PublicationPreview {
  const filed = patent.status.filed;
  const registered = patent.status.registered;
  const parts: string[] = [];
  if (filed.date && filed.number) {
    parts.push(`출원 ${filed.number}, ${formatPatentDate(filed.date)}`);
  }
  if (registered.date && registered.number) {
    parts.push(`등록 ${registered.number}, ${formatPatentDate(registered.date)}`);
  }

  return {
    href: `/publications/patents#${encodeURIComponent(titleToId(patent.title.ko))}`,
    title: patent.title.ko,
    subtitle: patent.title.en,
    authors: (patent.authors ?? []).map((author) => author.name).filter(Boolean).join(', '),
    meta: parts.join(' · '),
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

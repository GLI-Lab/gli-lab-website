import { NewsData } from '@/data/loaders/types';
import { titleToId } from '@/lib/utils';

export type NewsMarkupKind = 'paper' | 'patent' | 'project';

export const NEWS_MARKUP_LABELS: Record<NewsMarkupKind, string> = {
  paper: 'Publication',
  patent: 'Patent',
  project: 'Project',
};

const TAG_PATTERNS: Record<NewsMarkupKind, RegExp> = {
  paper: /<paper>([^<]+)<\/>/g,
  patent: /<patent>([^<]+)<\/>/g,
  project: /<project>([^<]+)<\/>/g,
};

const TAG_HREF_BUILDERS: Record<NewsMarkupKind, (id: string) => string> = {
  paper: (id) => `/publications/papers#${encodeURIComponent(id)}`,
  patent: (id) => `/publications/patents#${encodeURIComponent(id)}`,
  project: (id) => `/research/projects#${encodeURIComponent(id)}`,
};

export interface NewsPopupAlertItem {
  kind: NewsMarkupKind;
  title: string;
  href: string;
}

/** @deprecated Use NewsPopupAlert */
export type PaperNewsAlert = NewsPopupAlert;

export interface NewsPopupAlert {
  id: string;
  date: string;
  headline: string;
  items: NewsPopupAlertItem[];
}

export interface GetNewsMarkupAlertsOptions {
  kinds: NewsMarkupKind | NewsMarkupKind[];
  max?: number;
}

function normalizeKinds(kinds: NewsMarkupKind | NewsMarkupKind[]): NewsMarkupKind[] {
  return Array.isArray(kinds) ? kinds : [kinds];
}

function extractHeadline(content: string): string {
  const firstLine = content.split('\n').find((line) => line.trim() !== '') ?? '';
  return firstLine
    .replace(/<paper>[^<]+<\/>/g, '')
    .replace(/<patent>[^<]+<\/>/g, '')
    .replace(/<project>[^<]+<\/>/g, '')
    .replace(/<profile=[^>]+>[^<]+<\/>/g, '')
    .trim();
}

export function hasMarkupTag(content: string, kind: NewsMarkupKind): boolean {
  return new RegExp(TAG_PATTERNS[kind].source).test(content);
}

export function hasAnyMarkupTag(content: string, kinds: NewsMarkupKind[]): boolean {
  return kinds.some((kind) => hasMarkupTag(content, kind));
}

export function extractTaggedItems(
  content: string,
  kinds: NewsMarkupKind[],
): NewsPopupAlertItem[] {
  const matches: Array<{ kind: NewsMarkupKind; title: string; index: number }> = [];

  for (const kind of kinds) {
    const pattern = new RegExp(TAG_PATTERNS[kind].source, 'g');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      matches.push({ kind, title: match[1].trim(), index: match.index });
    }
  }

  return matches
    .sort((a, b) => a.index - b.index)
    .map(({ kind, title }) => ({
      kind,
      title,
      href: TAG_HREF_BUILDERS[kind](titleToId(title)),
    }));
}

export function getNewsMarkupAlerts(
  news: NewsData[],
  options: GetNewsMarkupAlertsOptions,
): NewsPopupAlert[] {
  const kinds = normalizeKinds(options.kinds);
  const max = options.max ?? 3;

  const selectedNews = news.filter((item) => item.selected === true);
  const selectedWithMarkup = selectedNews.filter((item) =>
    hasAnyMarkupTag(item.content, kinds),
  );

  return selectedWithMarkup.slice(0, max).map((item, idx) => {
      const items = extractTaggedItems(item.content, kinds);
      const primary = items[0];
      const primaryKey = primary
        ? `${primary.kind}-${titleToId(primary.title)}`
        : String(idx);

      return {
        id: `${item.date}-${primaryKey}`,
        date: item.date,
        headline: extractHeadline(item.content),
        items,
      };
    });
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
import { getPapers, getPatents } from '@/data/loaders';
import type { PaperData, PatentData } from '@/data/loaders/types';
import { getPaperTitleId, isLocalizedPaperTitle, titleToId } from '@/lib/utils';
import {
  buildPublicationPath,
  PAPERS_BASE_PATH,
  PATENTS_BASE_PATH,
  slugToPublicationId,
} from '@/lib/publicationSlug';

export type PublicationSection = 'papers' | 'patents';

/** 개별 항목 하나의 공유 카드 정보 */
interface PublicationEntry {
  /** 목록의 DOM id와 같은 값. 주소의 slug로 쓴다 */
  id: string;
  title: string;
  description: string;
}

const SECTION_CONFIG = {
  papers: {
    basePath: PAPERS_BASE_PATH,
    getEntries: async () => (await getPapers()).map(toPaperEntry),
  },
  patents: {
    basePath: PATENTS_BASE_PATH,
    getEntries: async () => (await getPatents()).map(toPatentEntry),
  },
} as const;

/**
 * 논문 한 편의 공유 카드 정보.
 * 설명: "학회·저널 연도 | 저자". 예: "WSDM 2027 | Jimyeung Seo, Dayeon Hong, ..."
 * 게재 확정 전 논문은 학회 자리에 진행 상태를 쓴다. 예: "Under Review | ..."
 */
function toPaperEntry(paper: PaperData): PublicationEntry {
  // 한/영 제목이 모두 있으면 목록과 같이 한글 제목을 쓴다
  const title = isLocalizedPaperTitle(paper.title) ? paper.title.ko : paper.title;

  const venue = paper.venue?.acronym || paper.venue?.name;
  const venueOrStatus =
    paper.status === 'Accepted' ? [venue, paper.year].filter(Boolean).join(' ') : paper.status;
  const authors = paper.authors.map((author) => author.name).join(', ');

  return {
    id: getPaperTitleId(paper.title),
    title,
    description: [venueOrStatus, authors].filter(Boolean).join(' | '),
  };
}

/**
 * 특허 한 건의 공유 카드 정보.
 * 설명: "등록(또는 출원) 번호 (날짜) | 발명자". 예: "등록 10-1997222 (2019-07-01) | 오병국, 이경호"
 * 등록된 특허는 등록 정보를, 아직 출원 단계면 출원 정보를 쓴다.
 */
function toPatentEntry(patent: PatentData): PublicationEntry {
  const { filed, registered } = patent.status;
  const status =
    registered.date && registered.number
      ? `등록 ${registered.number} (${formatPatentDate(registered.date)})`
      : filed.date && filed.number
        ? `출원 ${filed.number} (${formatPatentDate(filed.date)})`
        : '';
  const authors = patent.authors.map((author) => author.name).join(', ');

  return {
    id: titleToId(patent.title.ko),
    title: patent.title.ko,
    description: [status, authors].filter(Boolean).join(' | '),
  };
}

/**
 * patent.yaml의 날짜를 "YYYY-MM-DD"로 바꾼다.
 * YAML 파서가 날짜를 UTC 자정의 Date로 읽고, 캐시를 거치면 ISO 문자열이 된다.
 * 어느 쪽이든 UTC 기준으로 읽어야 서버 시간대와 무관하게 YAML에 적힌 날짜가 나온다.
 */
function formatPatentDate(date: string | Date): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? String(date) : parsed.toISOString().slice(0, 10);
}

async function findEntry(
  section: PublicationSection,
  params: Promise<{ slug: string }>
): Promise<PublicationEntry | undefined> {
  const { slug } = await params;
  const id = slugToPublicationId(slug);
  const entries = await SECTION_CONFIG[section].getEntries();
  return entries.find((entry) => entry.id === id);
}

/** 개별 논문·특허 주소(/publications/papers/<slug>/)의 메타데이터 */
export async function generatePublicationItemMetadata(
  section: PublicationSection,
  params: Promise<{ slug: string }>
): Promise<Metadata> {
  const entry = await findEntry(section, params);
  // 없는 항목이면 목록 페이지의 메타데이터(layout)를 그대로 쓴다. 페이지는 목록으로 리다이렉트한다.
  if (!entry) return {};

  const { basePath } = SECTION_CONFIG[section];
  return getMetadata({
    // 제목: 논문·특허 제목만 쓴다 (" | GLI Lab"을 붙이지 않는다).
    title: entry.title,
    appendSiteTitle: false,
    description: entry.description,
    // 공유 카드의 주소(og:url)는 이 항목의 주소로 둔다.
    asPath: buildPublicationPath(basePath, entry.id),
    // 본문은 어느 항목 주소로 들어와도 전체 목록이라, 검색엔진에는 목록 주소를 대표 주소로 알린다.
    canonicalPath: basePath,
  });
}

/** 개별 논문·특허 주소의 페이지. 목록은 layout이 그리므로 여기서는 없는 항목만 걸러낸다. */
export async function renderPublicationItemPage(
  section: PublicationSection,
  params: Promise<{ slug: string }>
) {
  const entry = await findEntry(section, params);
  if (!entry) {
    redirect(`${SECTION_CONFIG[section].basePath}/`);
  }

  // 해당 항목으로 스크롤·강조하는 일은 목록 컴포넌트가 주소의 slug를 읽어 처리한다
  return null;
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getMetadata } from '@/lib/GetMetadata';
import { getGalleryItems } from '@/components/Gallery';
import {
  buildGalleryAsPath,
  findGalleryItemBySlug,
  GALLERY_BASE_PATH,
} from '@/components/Gallery/gallerySlug';
import { formatDateForDisplay } from '@/components/Gallery/helpers';

const TITLE = 'Gallery';
const DESCRIPTION = 'Photo albums of the Graph & Language Intelligence Lab at Konkuk University';

function resolveSlugParam(slug: string[] | undefined): string | undefined {
  return slug?.[0];
}

/** 공유 카드 설명에 넣는 앨범 설명 첫 문장의 최대 길이 */
const FIRST_SENTENCE_MAX_LENGTH = 120;

/**
 * 앨범 설명(config.yaml의 description)에서 첫 문장만 뽑는다.
 * 첫 문단(빈 줄 앞까지)의 줄바꿈을 공백으로 합치고, 첫 문장부호(. ! ?)까지만 쓴다.
 * 최대 길이를 넘으면 단어 경계에서 자르고 "…"를 붙인다.
 */
function getFirstSentence(description: string | undefined): string {
  if (!description) return '';

  const firstParagraph = description.trim().split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim();
  const sentence = firstParagraph.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? firstParagraph;
  if (sentence.length <= FIRST_SENTENCE_MAX_LENGTH) return sentence;

  const cut = sentence.slice(0, FIRST_SENTENCE_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  const atWordBoundary = lastSpace > FIRST_SENTENCE_MAX_LENGTH * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${atWordBoundary.replace(/[,.·\s]+$/, '')}…`;
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
      // 제목: 앨범 제목만 쓴다 (" | GLI Lab"을 붙이지 않는다).
      // 설명: "날짜 | 앨범 설명 첫 문장" (날짜는 앨범 카드에 보이는 표기 그대로).
      // 예: "2026-08-28 | 26-1학기 종강과 여름방학 마무리를 겸해, ... 회식 자리를 가졌습니다."
      // 날짜와 설명이 모두 없는 앨범은 목록 페이지와 같은 문구를 쓴다.
      const date = formatDateForDisplay(selected.date);
      const firstSentence = getFirstSentence(selected.description);
      return getMetadata({
        title: `${selected.title}`,
        appendSiteTitle: false,
        description: [date, firstSentence].filter(Boolean).join(' | ') || DESCRIPTION,
        asPath: buildGalleryAsPath(selected.slug),
        // 공유 미리보기 이미지: 이 앨범의 첫 번째 사진
        ogImage: selected.thumbnail,
      });
    }
  }

  return getMetadata({
    title: TITLE,
    description: DESCRIPTION,
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

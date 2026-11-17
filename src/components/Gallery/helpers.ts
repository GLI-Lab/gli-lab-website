// Client-side utility functions for Gallery components

export function isNewItem(date?: string): boolean {
  if (!date) return false;

  const startDate = getStartDateFromRange(date);
  const itemDate = new Date(startDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return itemDate >= sixMonthsAgo;
}

export function getStartDateFromRange(dateRange?: string): string {
  if (!dateRange) return '';

  if (dateRange.includes('~')) {
    const parts = dateRange.split('~').map((part) => part.trim());
    return parts[0];
  }

  return dateRange;
}

export function formatDateForDisplay(date?: string): string {
  if (!date) return '';
  return date;
}

export function getSortableDate(date?: string): Date {
  if (!date) return new Date(0);

  const startDate = getStartDateFromRange(date);
  const dateObj = new Date(startDate);

  if (!isNaN(dateObj.getTime())) {
    return dateObj;
  }

  return new Date(0);
}

/** 글을 나눈 조각 하나. `url`이면 링크로, `text`면 글자 그대로 그린다. */
export interface TextPart {
  type: 'text' | 'url';
  value: string;
}

/**
 * 글을 일반 글자와 주소(`http://`, `https://`)로 나눈다. 앨범 설명 안의 주소를 링크로 그릴 때 쓴다.
 * 주소 끝에 붙은 문장부호(마침표, 쉼표, 닫는 괄호 등)는 주소에 넣지 않고 글자로 남긴다.
 * 주소는 공백이나 줄바꿈에서 끝난다. 한글 slug가 들어간 주소도 받기 위해 한글에서 끊지 않으므로,
 * 주소 바로 뒤에 한글을 붙여 쓰면 그 글자까지 주소로 잡힌다.
 *
 * @param text 예: "발표 논문: https://example.com/paper. 감사합니다"
 * @returns    예: [text "발표 논문: "], [url "https://example.com/paper"], [text ". 감사합니다"]
 */
export function splitTextByUrls(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const urlPattern = /https?:\/\/[^\s<>"']+/g;
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const start = match.index ?? 0;
    const url = match[0].replace(/[.,;:!?)\]}]+$/, '');

    if (start > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    parts.push({ type: 'url', value: url });
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}

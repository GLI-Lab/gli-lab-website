// Client-side utility functions for Gallery components

// Utility function to check if an item is new (within 6 months)
export function isNewItem(date?: string): boolean {
  if (!date) return false;
  
  // Handle date ranges - use the start date for "new" calculation
  const startDate = getStartDateFromRange(date);
  const itemDate = new Date(startDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return itemDate >= sixMonthsAgo;
}

// Helper function to extract start date from a date range
export function getStartDateFromRange(dateRange?: string): string {
  if (!dateRange) return '';
  
  // Check if it's a date range (contains "~")
  if (dateRange.includes('~')) {
    const parts = dateRange.split('~').map(part => part.trim());
    return parts[0]; // Return the start date
  }
  
  // If it's a single date, return as is
  return dateRange;
}

// Helper function to format date for display
export function formatDateForDisplay(date?: string): string {
  if (!date) return '';
  
  // Return the date string as-is from config.yaml
  return date;
}

// Helper function to get sortable date (for sorting purposes)
export function getSortableDate(date?: string): Date {
  if (!date) return new Date(0); // Very old date for items without date

  const startDate = getStartDateFromRange(date);
  const dateObj = new Date(startDate);

  if (!isNaN(dateObj.getTime())) {
    return dateObj;
  }

  return new Date(0); // Fallback for invalid dates
}

function formatDateYyMm(date?: string): string {
  const d = getSortableDate(date);
  if (d.getTime() === 0) return '';

  const yy = String(d.getFullYear() % 100).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}.${mm}`;
}

function formatDateYyyyMm(date?: string): string {
  const d = getSortableDate(date);
  if (d.getTime() === 0) return '';

  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}.${mm}`;
}

export type GallerySnapLabelFormat = 'yy' | 'yyyy';

function formatSnapTimestamp(timestamp: number, format: GallerySnapLabelFormat): string {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const year =
    format === 'yyyy'
      ? String(d.getFullYear())
      : String(d.getFullYear() % 100).padStart(2, '0');
  return `${year}.${mm}`;
}

export interface GalleryDateAnchor {
  itemId: string;
  label: string;
}

function getLayoutDocumentTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function getHeaderStickyTopPx(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim();
  return Number.parseFloat(raw) || 76;
}

/** sticky nav가 헤더 아래에 붙기 시작하는 scrollY (sticky 상태에서도 layout top 사용) */
export function getGalleryYearNavStickyScrollY(nav: HTMLElement | null): number {
  if (typeof window === 'undefined') return 0;

  const stickyTop =
    (nav && Number.parseFloat(getComputedStyle(nav).top)) || getHeaderStickyTopPx();

  const origin = document.querySelector<HTMLElement>('[data-gallery-sticky-origin]');
  if (origin && getComputedStyle(origin).display !== 'none') {
    return Math.max(0, getLayoutDocumentTop(origin) - stickyTop);
  }

  if (nav && getComputedStyle(nav).display !== 'none') {
    return Math.max(0, getLayoutDocumentTop(nav) - stickyTop);
  }

  // 1601px+ 레일: 슬라이더 nav가 hidden — 그리드 영역 상단 기준
  const gridWrap = document.querySelector<HTMLElement>('[data-gallery-grid-wrap]');
  if (gridWrap) {
    return Math.max(0, getLayoutDocumentTop(gridWrap) - stickyTop);
  }

  const total = document.querySelector<HTMLElement>('[data-gallery-total]');
  if (total) {
    return Math.max(0, getLayoutDocumentTop(total) - stickyTop);
  }

  return 0;
}

/** 스크롤스파이 기준선(뷰포트 상단에서의 비율). snap 클릭 이동 목표도 같은 값을 써야 재이동이 없다. */
export const GALLERY_FOCAL_VIEWPORT_RATIO = 0.35;

/** 앵커 아이템을 focal 기준선에 맞추는 목표 scrollY */
export function getFocalAlignedScrollY(el: HTMLElement): number {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const itemTop = el.getBoundingClientRect().top + window.scrollY;
  // top이 focalY(=scrollY+vh*ratio) 이하가 되도록 1px 여유
  return Math.max(0, itemTop - viewportHeight * GALLERY_FOCAL_VIEWPORT_RATIO + 1);
}

/** focal 라인 바로 위에 있는(가장 최근 지나친) 앵커의 index — 배열 순서 무관, DOM 위치 기준 */
export function resolveActiveSnapIndexFromAnchors(
  anchors: GalleryDateAnchor[],
  getItemElement: (itemId: string) => HTMLElement | null,
  options?: {
    defaultIndex?: number;
    stickyScrollY?: number | null;
  }
): number | null {
  if (typeof window === 'undefined') return null;
  if (anchors.length === 0) return null;
  if (anchors.length === 1) return 0;

  const defaultIndex = options?.defaultIndex ?? anchors.length - 1;

  if (options?.stickyScrollY != null && window.scrollY <= options.stickyScrollY + 8) {
    return defaultIndex;
  }

  const focalRatio = GALLERY_FOCAL_VIEWPORT_RATIO;
  const viewportHeight = typeof window !== 'undefined'
    ? (window.visualViewport?.height ?? window.innerHeight)
    : 0;
  const focalY = window.scrollY + viewportHeight * focalRatio;

  // 배열 순서(과거→최신 or 최신→과거)에 의존하지 않도록 DOM 위치로만 판단한다.
  // active  = focal 라인 바로 위(top ≤ focalY 중 top이 가장 큰) 앵커 = 방금 지나친 항목
  // topmost = 시각상 최상단(top이 가장 작은) 앵커 = focal 위에 아무것도 없을 때의 폴백
  let active = -1;
  let activeTop = -Infinity;
  let topmostIndex = defaultIndex;
  let topmostTop = Infinity;
  let foundAny = false;

  for (let i = 0; i < anchors.length; i++) {
    const el = getItemElement(anchors[i].itemId);
    if (!el) continue;

    foundAny = true;
    const top = el.getBoundingClientRect().top + window.scrollY;

    if (top < topmostTop) {
      topmostTop = top;
      topmostIndex = i;
    }
    if (top <= focalY && top > activeTop) {
      activeTop = top;
      active = i;
    }
  }

  if (!foundAny) return null;
  return active >= 0 ? active : topmostIndex;
}

/** 타임라인을 N개 스냅으로 나누고, 각 스냅에 가장 가까운 항목으로 스크롤 */
export function buildGallerySnapAnchors(
  items: { id: string; date?: string }[],
  snapPointCount = 5,
  labelFormat: GallerySnapLabelFormat = 'yy'
): GalleryDateAnchor[] {
  const formatDate =
    labelFormat === 'yyyy' ? formatDateYyyyMm : formatDateYyMm;

  const dated = items
    .map((item) => {
      const sortable = getSortableDate(item.date);
      const label = formatDate(item.date);
      if (!label || sortable.getTime() === 0) return null;
      return { itemId: item.id, label, sortKey: sortable.getTime() };
    })
    .filter((a): a is { itemId: string; label: string; sortKey: number } => a != null)
    .sort((a, b) => a.sortKey - b.sortKey);

  if (dated.length === 0) return [];
  if (dated.length === 1) {
    return [{ itemId: dated[0].itemId, label: dated[0].label }];
  }

  const n = Math.max(2, snapPointCount);
  const minTime = dated[0].sortKey;
  const maxTime = dated[dated.length - 1].sortKey;

  if (minTime === maxTime) {
    return [{ itemId: dated[dated.length - 1].itemId, label: dated[dated.length - 1].label }];
  }

  const anchors: GalleryDateAnchor[] = [];

  for (let i = 0; i < n; i++) {
    const targetTime = minTime + (i / (n - 1)) * (maxTime - minTime);
    const label = formatSnapTimestamp(targetTime, labelFormat);

    let bestIdx = 0;
    let bestDist = Infinity;
    dated.forEach((entry, idx) => {
      const dist = Math.abs(entry.sortKey - targetTime);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    anchors.push({ itemId: dated[bestIdx].itemId, label });
  }

  anchors[0] = {
    itemId: dated[0].itemId,
    label: formatSnapTimestamp(dated[0].sortKey, labelFormat),
  };
  anchors[n - 1] = {
    itemId: dated[dated.length - 1].itemId,
    label: formatSnapTimestamp(dated[dated.length - 1].sortKey, labelFormat),
  };

  return anchors;
}

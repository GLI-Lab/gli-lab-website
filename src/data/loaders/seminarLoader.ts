import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { SeminarData } from './types';
import { listPublicFiles } from './publicFileIndex';

/** js-yaml Date / ISO 문자열 → YYYY-MM-DD (타임존 무관) */
function normalizeSeminarDate(date: unknown): string {
  if (!date) return '';

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof date === 'string') {
    const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  return String(date);
}

/** public/ 아래 상대경로를 POSIX 형태로 정규화 */
function toPublicRelative(slidePath: string): string {
  return slidePath.replace(/^\//, '').replace(/\\/g, '/');
}

/**
 * 디렉터리 안 파일명을 NFC 키로 조회.
 * macOS에서 올린 한글 PDF는 NFD, YAML은 NFC인 경우가 많아 둘 다 매칭한다.
 * public/ 원본을 readdir 하지 않고 prebuild 파일명 인덱스를 쓴다 (Vercel 250MB 제한).
 */
function loadSlideLookup(dirRelative: string): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const file of listPublicFiles(dirRelative)) {
    lookup.set(file.normalize('NFC'), file);
  }
  return lookup;
}

export interface GetSeminarsOptions {
  /** Only enrich slideExists for this many newest items (YAML order). */
  count?: number;
}

async function enrichWithSlideExists(items: SeminarData[]): Promise<SeminarData[]> {
  const lookups = new Map<string, Map<string, string>>();
  for (const item of items) {
    const slide = item.slide?.trim();
    if (!slide) continue;
    const dir = path.posix.dirname(toPublicRelative(slide));
    if (!lookups.has(dir)) lookups.set(dir, loadSlideLookup(dir));
  }

  return items.map((item) => {
    const slide = item.slide?.trim();
    if (!slide) return { ...item, slideExists: false };

    const relative = toPublicRelative(slide);
    const dir = path.posix.dirname(relative);
    const actualName = lookups.get(dir)?.get(path.posix.basename(relative).normalize('NFC'));
    if (!actualName) return { ...item, slideExists: false };

    return { ...item, slide: `/${dir}/${actualName}`, slideExists: true };
  });
}

export async function getSeminarsUncached(): Promise<SeminarData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'seminar.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const raw = yaml.load(yamlText) as SeminarData[];
    const normalized = raw.map((item) => ({
      ...item,
      date: normalizeSeminarDate(item.date),
    }));
    return enrichWithSlideExists(normalized);
  } catch (error) {
    console.error('Error loading seminar data:', error);
    return [];
  }
}

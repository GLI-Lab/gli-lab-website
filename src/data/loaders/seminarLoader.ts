import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { SeminarData } from './types';

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

async function slideFileExists(slidePath: string): Promise<boolean> {
  const relative = slidePath.replace(/^\//, '');
  const absolute = path.join(process.cwd(), 'public', relative);
  try {
    await fs.access(absolute);
    return true;
  } catch {
    return false;
  }
}

export interface GetSeminarsOptions {
  /** Only enrich slideExists for this many newest items (YAML order). */
  count?: number;
}

async function enrichWithSlideExists(items: SeminarData[]): Promise<SeminarData[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.slide?.trim()) {
        const exists = await slideFileExists(item.slide.trim());
        return { ...item, slideExists: exists };
      }
      return { ...item, slideExists: false };
    })
  );
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

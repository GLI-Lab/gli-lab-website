import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { SeminarData } from './types';

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

export async function getSeminars(options?: GetSeminarsOptions): Promise<SeminarData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'seminar.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const raw = yaml.load(yamlText) as SeminarData[];
    const count = options?.count;
    const selected = count !== undefined ? raw.slice(0, count) : raw;
    return enrichWithSlideExists(selected);
  } catch (error) {
    console.error('Error loading seminar data:', error);
    return [];
  }
}

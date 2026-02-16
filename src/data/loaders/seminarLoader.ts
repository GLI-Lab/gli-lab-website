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

export async function getSeminars(): Promise<SeminarData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'seminar.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const raw = yaml.load(yamlText) as SeminarData[];
    const withExists: SeminarData[] = await Promise.all(
      raw.map(async (item) => {
        if (item.slide?.trim()) {
          const exists = await slideFileExists(item.slide.trim());
          return { ...item, slideExists: exists };
        }
        return { ...item, slideExists: false };
      })
    );
    return withExists;
  } catch (error) {
    console.error('Error loading seminar data:', error);
    return [];
  }
}

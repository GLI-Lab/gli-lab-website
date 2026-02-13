import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { SeminarData } from './types';

export async function getSeminars(): Promise<SeminarData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'seminar.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    return yaml.load(yamlText) as SeminarData[];
  } catch (error) {
    console.error('Error loading seminar data:', error);
    return [];
  }
}

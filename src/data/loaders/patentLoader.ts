import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { PatentData } from './types';

// Patent 데이터를 가져오는 함수
export async function getPatents(): Promise<PatentData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'patent.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    return yaml.load(yamlText) as PatentData[];
  } catch (error) {
    console.error('Error loading patents data:', error);
    return [];
  }
}


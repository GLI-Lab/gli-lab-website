import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { StudyData } from './types';

// 스터디 데이터를 가져오는 함수
export async function getStudies(): Promise<StudyData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'study.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    return yaml.load(yamlText) as StudyData[];
  } catch (error) {
    console.error('Error loading study data:', error);
    return [];
  }
} 
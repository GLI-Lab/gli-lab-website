import yaml from 'js-yaml'
import path from 'path';
import fs from 'fs/promises';

export interface StudyData {
  title: string
  description: string
  start_date: string
  end_date: string | null
  participants: string[]
  link?: string  // 스터디 링크 추가
}

// 스터디 데이터를 가져오는 함수
export async function getStudyItems(): Promise<StudyData[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'study.yaml');
  const yamlText = await fs.readFile(filePath, 'utf8');
  return yaml.load(yamlText) as StudyData[];
} 
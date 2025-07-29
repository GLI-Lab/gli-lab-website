import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { NewsData } from './types';

// 뉴스 데이터를 가져오는 함수
export async function getNews(): Promise<NewsData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'news.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as NewsData[];
    return [...rawData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error loading news data:', error);
    return [];
  }
} 
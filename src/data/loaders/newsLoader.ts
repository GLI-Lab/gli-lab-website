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
    
    // 타입 검증 및 정렬
    const validatedData = rawData.map(item => ({
      ...item,
      type: item.type || 'General' as const // type이 없으면 General로 기본값 설정
    }));
    
    return [...validatedData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error loading news data:', error);
    return [];
  }
} 
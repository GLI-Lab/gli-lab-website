import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { PaperData } from './types';

// Paper 데이터를 YAML 파일에서 읽어오는 함수
// - publications/paper가 정적 페이지(○) 라면
//   - 모든 사용자에게 같은 논문 데이터를 보여주므로 빌드 타임에 한번 PaperData를 만들어두고 getPapers() 함수가 실행되지 않음
// - publications/paper가 동적 페이지(ƒ) 라면
//   - fs.readFile은 fetch와 달리 Next.js 데이터 캐싱하지 않음
//   - 따라서 동적 렌더링이 꼭 필요하면 unstable_cache() 같은 별도 캐시 처리를 고려
export async function getPapers(): Promise<PaperData[]> {
  try {
    // console.log(`[getPapers] YAML 읽기 호출됨: ${new Date().toISOString()}`);
    const filePath = path.join(process.cwd(), 'src', 'data', 'paper.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    return yaml.load(yamlText) as PaperData[];
  } catch (error) {
    console.error('Error loading papers data:', error);
    return [];
  }
} 
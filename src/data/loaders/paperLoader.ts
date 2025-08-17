import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { PaperYAML, PaperData, AuthorData } from './types';
import { parseAuthorString } from './utils';

// Raw paper data를 구조화된 PaperData로 변환
function transformPaperData(rawPaper: PaperYAML): PaperData {
  const authors: AuthorData[] = [];
  
  rawPaper.authors.forEach((authorGroup: any) => {
    Object.entries(authorGroup).forEach(([role, authorString]) => {
      const { profileId, displayName } = parseAuthorString(authorString as string);
      
      authors.push({
        role,
        profileId,
        displayName
      });
    });
  });

  return {
    title: rawPaper.title,
    status: rawPaper.status,
    link: rawPaper.link,
    authors,
    year: rawPaper.year,
    venue: rawPaper.venue
  };
}

// Paper 데이터를 가져오는 함수
export async function getPapers(): Promise<PaperData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'paper.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as PaperYAML[];
    return rawData.map(transformPaperData);
  } catch (error) {
    console.error('Error loading papers data:', error);
    return [];
  }
} 
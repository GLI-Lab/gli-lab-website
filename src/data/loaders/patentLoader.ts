import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs/promises';
import { PatentYAML, PatentData, PatentAuthorData } from './types';

// Raw patent data를 구조화된 PatentData로 변환
function transformPatentData(rawPatent: PatentYAML): PatentData {
  const authors: PatentAuthorData[] = rawPatent.authors.map(author => ({
    ID: author.ID,
    name: author.name
  }));

  return {
    title: rawPatent.title,
    scope: rawPatent.scope,
    status: rawPatent.status,
    authors
  };
}

// Patent 데이터를 가져오는 함수
export async function getPatents(): Promise<PatentData[]> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'patent.yaml');
    const yamlText = await fs.readFile(filePath, 'utf8');
    const rawData = yaml.load(yamlText) as PatentYAML[];
    return rawData.map(transformPatentData);
  } catch (error) {
    console.error('Error loading patents data:', error);
    return [];
  }
}


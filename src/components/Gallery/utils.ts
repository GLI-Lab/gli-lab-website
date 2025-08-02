import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GalleryItem } from './types';
import { getSortableDate } from './helpers';

// Centralized gallery configuration (fallback when config.json doesn't exist)
const galleryConfig: Record<string, {
  title?: string;
  description?: string;
  date?: string;
}> = {
  // Add your gallery configurations here
  // Example:
  // 'sample-project-1': {
  //   title: 'Sample Project 1',
  //   description: 'Description for sample project 1',
  //   date: '2024-01-01'
  // }
};

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const galleryPath = path.join(process.cwd(), 'public/images/gallery');
  
  try {
    const folders = fs.readdirSync(galleryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const items: GalleryItem[] = [];

    for (const folder of folders) {
      const folderPath = path.join(galleryPath, folder);
      const configYamlPath = path.join(folderPath, 'config.yaml');
      
      // 폴더 내 이미지 파일들 찾기
      const files = fs.readdirSync(folderPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
      ).sort(); // 파일명 순으로 정렬

      if (imageFiles.length === 0) continue;

      let config: any = {};
      
      // config.yaml 파일 읽기
      if (fs.existsSync(configYamlPath)) {
        try {
          const configContent = fs.readFileSync(configYamlPath, 'utf-8');
          config = yaml.load(configContent) as any;
          
          // description에서 \n을 실제 줄바꿈으로 변환
          if (config.description && typeof config.description === 'string') {
            config.description = config.description.replace(/\\n/g, '\n');
          }
        } catch (error) {
          console.warn(`Failed to parse config.yaml in ${folder}:`, error);
        }
      }
      
      // 설정 파일이 없거나 실패한 경우
      if (Object.keys(config).length === 0) {
        config = galleryConfig[folder] || {};
      }

      const imagePaths = imageFiles.map(file => `/images/gallery/${folder}/${file}`);

      const item: GalleryItem = {
        id: folder,
        title: config.title || folder,
        description: config.description,
        images: imagePaths,
        thumbnail: imagePaths[0],
        date: config.date
      };

      items.push(item);
    }

    // 날짜순으로 정렬 (최신순) - date range 지원
    return items.sort((a, b) => {
      const dateA = getSortableDate(a.date);
      const dateB = getSortableDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  } catch (error) {
    console.error('Failed to load gallery items:', error);
    return [];
  }
}

// Legacy function name for backward compatibility
export const getGalleryItemsSecure = getGalleryItems; 
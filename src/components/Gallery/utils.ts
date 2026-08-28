import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { GalleryItem } from './types';
import { getSortableDate } from './helpers';
import { toGallerySlug, uniquifyGallerySlugs } from './gallerySlug';

// Centralized gallery configuration (fallback when config.json doesn't exist)
const galleryConfig: Record<string, {
  title?: string;
  description?: string;
  date?: string;
}> = {
  // Add your gallery configurations here
};

export interface GetGalleryItemsOptions {
  /** Only fully load this many newest items (config read for all folders, images for top N only). */
  count?: number;
}

function loadFolderConfig(folderPath: string, folder: string): Record<string, unknown> {
  const configYamlPath = path.join(folderPath, 'config.yaml');
  let config: Record<string, unknown> = {};

  if (fs.existsSync(configYamlPath)) {
    try {
      const configContent = fs.readFileSync(configYamlPath, 'utf-8');
      config = (yaml.load(configContent) as Record<string, unknown>) ?? {};

      if (config.description && typeof config.description === 'string') {
        config.description = config.description.replace(/\\n/g, '\n');
      }
    } catch (error) {
      console.warn(`Failed to parse config.yaml in ${folder}:`, error);
    }
  }

  if (Object.keys(config).length === 0) {
    config = galleryConfig[folder] || {};
  }

  return config;
}

function loadImageFiles(folderPath: string): string[] {
  const files = fs.readdirSync(folderPath);
  return files
    .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function buildGalleryItem(
  folder: string,
  config: Record<string, unknown>,
  imageFiles: string[]
): GalleryItem {
  const imagePaths = imageFiles.map((file) => `/images/gallery/${folder}/${file}`);
  const date = typeof config.date === 'string' ? config.date : undefined;

  return {
    id: folder,
    slug: toGallerySlug(date, folder),
    title: (typeof config.title === 'string' ? config.title : undefined) || folder,
    description: typeof config.description === 'string' ? config.description : undefined,
    images: imagePaths,
    thumbnail: imagePaths[0],
    date,
  };
}

export async function getGalleryItems(options?: GetGalleryItemsOptions): Promise<GalleryItem[]> {
  const galleryPath = path.join(process.cwd(), 'public/images/gallery');
  const count = options?.count;

  try {
    const folders = fs
      .readdirSync(galleryPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    if (count !== undefined) {
      const folderMeta = folders.map((folder) => {
        const folderPath = path.join(galleryPath, folder);
        const config = loadFolderConfig(folderPath, folder);
        const date = typeof config.date === 'string' ? config.date : undefined;
        return { folder, folderPath, config, sortDate: getSortableDate(date) };
      });

      folderMeta.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

      const items: GalleryItem[] = [];
      for (const { folder, folderPath, config } of folderMeta) {
        if (items.length >= count) break;

        const imageFiles = loadImageFiles(folderPath);
        if (imageFiles.length === 0) continue;

        items.push(buildGalleryItem(folder, config, imageFiles));
      }

      return uniquifyGallerySlugs(items);
    }

    const items: GalleryItem[] = [];

    for (const folder of folders) {
      const folderPath = path.join(galleryPath, folder);
      const imageFiles = loadImageFiles(folderPath);
      if (imageFiles.length === 0) continue;

      const config = loadFolderConfig(folderPath, folder);
      items.push(buildGalleryItem(folder, config, imageFiles));
    }

    items.sort((a, b) => {
      const dateA = getSortableDate(a.date);
      const dateB = getSortableDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return uniquifyGallerySlugs(items);
  } catch (error) {
    console.error('Failed to load gallery items:', error);
    return [];
  }
}

// Legacy function name for backward compatibility
export const getGalleryItemsSecure = getGalleryItems;

export interface GalleryItem {
  id: string;
  /** URL slug (config date + 같은 날짜 폴더 접미사) */
  slug: string;
  title: string;
  description?: string;
  images: string[];
  thumbnail: string;
  date?: string;
}

export interface GalleryData {
  items: GalleryItem[];
} 
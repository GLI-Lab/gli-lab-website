export interface GalleryItem {
  id: string;
  /** URL slug (config date 기반) */
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
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  images: string[];
  thumbnail: string;
  date?: string;
}

export interface GalleryData {
  items: GalleryItem[];
} 
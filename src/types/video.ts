export interface Category {
  slug: string;
  name: string;
  iconUrl: string;
}

export interface Video {
  title: string;
  mediaUrl: string;
  mediaType: 'YOUTUBE' | 'MP4';
  thumbnailUrl: string;
  slug: string;
  duration: string;
  category?: Category;
}

export interface CategoryData {
  category: Category;
  contents: Video[];
}

export interface AppData {
  categories: CategoryData[];
}

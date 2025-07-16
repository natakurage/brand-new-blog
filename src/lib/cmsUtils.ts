import { BlogPostManager, SongManager, PostListManager, AlbumManager, fetchGlobalSettings } from './cms';
import { unstable_cache } from 'next/cache';

export const BlogItemManagerMap = {
  BlogPost: BlogPostManager,
  Song: SongManager
};

export const ItemListManagerMap = {
  PostList: PostListManager,
  Album: AlbumManager
};

export const BlogDataManagerMap = {
  ...BlogItemManagerMap,
  ...ItemListManagerMap
};

export const isBlogItemManagerMapKey = (key: string): key is keyof typeof BlogItemManagerMap => {
  return key in BlogItemManagerMap;
};

export const isItemListManagerMapKey = (key: string): key is keyof typeof ItemListManagerMap => {
  return key in ItemListManagerMap;
};

export const isBlogDataManagerMapKey = (key: string): key is keyof typeof BlogDataManagerMap => {
  return key in BlogDataManagerMap;
};

export const loadGlobalSettings = unstable_cache(fetchGlobalSettings, ["globalSettings"], {
  tags: ["globalSettings"],
  revalidate: 86400, // 1 day
});

export const cmsToType = {
  blogPost: 'BlogPost',
  song: 'Song',
  postList: 'PostList',
  musicAlbum: 'Album'
} as const;

export const isValidContentType = (type: string): type is keyof typeof cmsToType => {
  return type in cmsToType;
};
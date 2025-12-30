import { BlogPostManager, SongManager, PostListManager, AlbumManager } from './cms';

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

export const cmsToType = {
  blogPost: 'BlogPost',
  song: 'Song',
  postList: 'PostList',
  musicAlbum: 'Album'
} as const;

export const isValidContentType = (type: string): type is keyof typeof cmsToType => {
  return type in cmsToType;
};

export const constants = {
  lettersPerMinute: 500
};
import type { License } from "./license";

export type Kind = "article" | "song" | "postList" | "album" | "tag";

export interface LinkItem {
  href: string;
  name: string;
}

export interface Tag {
  kind: "tag";
  slug: string;
  name: string;
  contentWarning?: string;
}

export interface GlobalSettings {
  siteName: string;
  description: string;
  author: string;
  authorUrl?: string;
  copyright: string;
  donate?: string;
  donateUrl?: string;
  bio: string;
  contactUrl?: string;
  useSidebar: boolean;
  adblock: boolean;
  showRelatedPosts: boolean;
  showNewPosts: boolean;
  itemsPerPage: number;
  recommendedPosts: string[];
  socials: LinkItem[];
  navbarPages: LinkItem[];
  footerPages: LinkItem[];
  avatar?: string;
  topLogo?: string;
  banner?: string;
  favicon: string;
  appleTouchIcon: string;
}

export interface BlogData {
  kind: Kind;
  id: string;
  title: string;
  slug: string;
  description?: string;
  tags: Tag[];
}

export interface BlogItemMeta extends BlogData {
  createdAt: Date;
  updatedAt: Date;
  license: License;
}

export interface BlogItem extends BlogItemMeta {
  content: string;
}

export interface ItemList<T extends BlogItem> extends BlogData {
  items: T[];
}

export interface ArticleMeta extends BlogItemMeta {
  kind: "article";
  mainImage?: string;
  showToc?: boolean;
}

export interface BlogPost extends ArticleMeta {
  content: string;
}

export interface SongMeta extends BlogItemMeta {
  kind: "song";
  artist: string[];
  credit?: string[];
  releaseDate?: string;
  url?: string[];
  streamUrl?: string;
}

export interface Song extends SongMeta {
  content: string;
  lyrics?: string;
}

export interface PostListMeta extends BlogData {
  kind: "postList";
  inverted: boolean;
}

export interface PostList extends PostListMeta {
  items: BlogPost[];
}

export interface AlbumMeta extends BlogData {
  kind: "album";
  releaseDate?: string;
  artist?: string[];
  credit?: string[];
  license: License;
}

export interface Album extends AlbumMeta {
  items: Song[];
}

export interface listNavigatorItem {
  title: string;
  href: string;
}

export interface listNavigatorInfo {
  listTitle: string;
  listHref: string;
  prev: null | listNavigatorItem;
  next: null | listNavigatorItem;
}

export type Content = BlogPost | Song | PostList | Album;

export interface Summary {
  excerpt: string;
  length: number;
  readingMinutes: number;
}

// 一覧用の型：本文や中身を除いたメタデータに、本文から計算した要約を加えたもの
export type ArticleSummary = ArticleMeta & Summary;
export type SongSummary = SongMeta & Summary;
export type PostListSummary = PostListMeta;
export type AlbumSummary = AlbumMeta;

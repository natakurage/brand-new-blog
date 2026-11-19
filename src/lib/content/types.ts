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

export interface BlogItem extends BlogData {
  content: string;
  createdAt: Date;
  updatedAt: Date;
  license: License;
}

export interface ItemList<T extends BlogItem> extends BlogData {
  items: T[];
}

export interface BlogPost extends BlogItem {
  kind: "article",
  mainImage?: string;
  content: string,
  createdAt: Date,
  updatedAt: Date,
  license: License;
  showToc?: boolean
}

export interface Song extends BlogItem {
  kind: "song";
  content: string;
  createdAt: Date;
  updatedAt: Date;
  artist: string[];
  credit?: string[];
  lyrics?: string;
  releaseDate?: string;
  license: License;
  url?: string[];
  streamUrl?: string;
}

export interface PostList extends ItemList<BlogPost> {
  kind: "postList";
  inverted: boolean;
}

export interface Album extends ItemList<Song> {
  kind: "album";
  releaseDate?: string;
  artist?: string[];
  credit?: string[];
  license: License;
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

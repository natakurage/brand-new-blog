import type { License } from "./license";

export interface LinkItem {
  href: string;
  name: string;
}

export interface Tag {
  typeUrl: "tags";
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
  typeUrl: string;
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
  typeUrl: "articles",
  mainImage?: string;
  content: string,
  createdAt: Date,
  updatedAt: Date,
  license: License;
  showToc?: boolean
}

export interface Song extends BlogItem {
  typeUrl: "songs";
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
  typeUrl: "lists";
  inverted: boolean;
}

export interface Album extends ItemList<Song> {
  typeUrl: "albums";
  releaseDate?: string;
  artist?: string[];
  credit?: string[];
  license: License;
}

export interface listNavigatorItem {
  title: string;
  slug: string;
  typeUrl: string;
}

export interface listNavigatorInfo {
  listTitle: string;
  typeUrl: string;
  prev: null | listNavigatorItem;
  next: null | listNavigatorItem;
}

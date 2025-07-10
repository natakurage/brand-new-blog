import { Tag } from "contentful";
import type { LicenseType } from "./licenses";

export interface LinkItem {
  href: string;
  name: string;
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
}

export interface BlogItem extends BlogData {
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  licenseSelect?: LicenseType;
  license?: string;
}

export interface ItemList<T extends BlogItem> extends BlogData {
  items: T[];
  description?: string;
}

export interface BlogPost extends BlogItem {
  typeUrl: "articles",
  id: string,
  title: string,
  slug: string,
  content: string,
  createdAt: string,
  updatedAt: string,
  tags?: Tag[],
  licenseSelect?: LicenseType,
  license?: string,
  showToc?: boolean
}

export interface Song extends BlogItem {
  typeUrl: "songs";
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  artist: string[];
  credit?: string[];
  lyrics?: string;
  releaseDate?: string;
  tags?: Tag[];
  licenseSelect?: LicenseType;
  license?: string;
  url?: string[];
  streamUrl?: string;
}

export interface PostList extends ItemList<BlogPost> {
  typeUrl: "lists";
  id: string,
  title: string,
  slug: string,
  items: BlogPost[],
  description?: string
}

export interface Album extends ItemList<Song> {
  typeUrl: "albums";
  id: string;
  title: string;
  slug: string;
  items: Song[];
  description?: string;
  releaseDate?: string;
  artist?: string[];
  credit?: string[];
  tags?: Tag[];
  licenseSelect?: LicenseType;
  license?: string;
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
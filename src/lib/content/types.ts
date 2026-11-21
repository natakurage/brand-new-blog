import type { License } from "./license";

export type Kind = ContentKind | Tag["kind"];

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
  // 「Copyright © 年」に続く権利者の表記。前置きと年は表示する側が付ける
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

// kind を持たない共通部分。kind は末端の型でリテラルとして決める
export interface ContentBase {
  title: string;
  slug: string;
  description?: string;
  tags: Tag[];
}

export interface WorkBase extends ContentBase {
  createdAt: Date;
  updatedAt: Date;
  license: License;
}

export interface ArticleMeta extends WorkBase {
  kind: "article";
  mainImage?: string;
}

export interface BlogPost extends ArticleMeta, Digest {
  content: string;
}

export interface SongMeta extends WorkBase {
  kind: "song";
  artist: string[];
  credit: string[];
  releaseDate?: string;
  url: string[];
  streamUrl?: string;
}

export interface Song extends SongMeta, Digest {
  content: string;
  lyrics?: string;
}

export interface PostListMeta extends ContentBase {
  kind: "postList";
}

export interface PostList extends PostListMeta {
  items: ArticleSummary[];
}

export interface AlbumMeta extends WorkBase {
  kind: "album";
  releaseDate?: string;
  artist: string[];
  credit: string[];
}

export interface Album extends AlbumMeta {
  items: SongSummary[];
}

export type Content = BlogPost | Song | PostList | Album;

export interface Digest {
  excerpt: string;
  length: number;
  readingMinutes: number;
}

export type ArticleSummary = ArticleMeta & Digest;
export type SongSummary = SongMeta & Digest;
export type PostListSummary = PostListMeta;
export type AlbumSummary = AlbumMeta;

export type ItemSummary = ArticleSummary | SongSummary;
export type CollectionSummary = PostListSummary | AlbumSummary;
export type ContentSummary = ItemSummary | CollectionSummary;

export type ItemKind = ItemSummary["kind"];
export type CollectionKind = CollectionSummary["kind"];
export type ContentKind = ContentSummary["kind"];

// 本文を持ち、抜粋と分量があるもの（記事・曲）
export const hasDigest = <T extends ContentBase>(value: T): value is Extract<T, Digest> => "excerpt" in value;

// 作品として日付とライセンスを持つもの（記事・曲・アルバム）
export const isWork = <T extends ContentBase>(value: T): value is Extract<T, WorkBase> => "createdAt" in value;

type ItemKindIn<C extends CollectionKind> = Extract<PostList | Album, { kind: C }>["items"][number]["kind"];

// リスト・アルバムに入る項目の種類
export const itemKindIn: { [C in CollectionKind]: ItemKindIn<C> } = { postList: "article", album: "song" };

export const isCollectionKind = (kind: Kind): kind is CollectionKind => Object.hasOwn(itemKindIn, kind);

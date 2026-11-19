import type {
  Album,
  AlbumSummary,
  ArticleMeta,
  ArticleSummary,
  BlogPost,
  GlobalSettings,
  PostList,
  PostListSummary,
  Song,
  SongSummary,
  Tag,
} from "./types";

/*
 * コンテンツを取得する窓口。実装（CMS ごとの adapter）はこの契約を守る。
 *
 * - 見つからないときは null を返す
 * - 通信やデータの異常は例外を投げる（null に変換しない）
 * - 戻り値は正規化済み：参照切れの要素は除かれ、必須のフィールドは埋まっている
 * - 一覧（list など）は本文や中身を含まない一覧用の型を返す
 */

export type Page<T> = { items: T[]; total: number };

// page は 1 始まり
export type PageRequest = { page: number; size: number };

// preview が true なら下書きを含めて読む
export type ReadContext = { preview: boolean };

export type ArticleListQuery = {
  page: PageRequest;
  tag?: string;
  slugs?: string[];
  exclude?: string[];
};

// slug で引けるもの。allSlugs は静的生成のためのもので、公開済みのもののみを返す
export interface SlugLookup<T> {
  findBySlug(slug: string, ctx: ReadContext): Promise<T | null>;
  allSlugs(): Promise<string[]>;
}

// ページ単位で一覧できるもの
export interface PagedList<S> {
  list(page: PageRequest, ctx: ReadContext): Promise<Page<S>>;
}

export interface ArticleRepository extends SlugLookup<BlogPost> {
  list(query: ArticleListQuery, ctx: ReadContext): Promise<Page<ArticleSummary>>;
  // タグを共有する記事を、article 自身を除いて返す
  related(article: ArticleMeta, limit: number, ctx: ReadContext): Promise<ArticleSummary[]>;
  search(text: string, page: PageRequest, ctx: ReadContext): Promise<Page<ArticleSummary>>;
}

export interface SongRepository extends SlugLookup<Song>, PagedList<SongSummary> {}

export interface PostListRepository extends SlugLookup<PostList>, PagedList<PostListSummary> {
  // articleSlug の記事を含むリスト
  containing(articleSlug: string, ctx: ReadContext): Promise<PostListSummary[]>;
}

export interface AlbumRepository extends SlugLookup<Album>, PagedList<AlbumSummary> {
  // songSlug の曲を含むアルバム
  containing(songSlug: string, ctx: ReadContext): Promise<AlbumSummary[]>;
}

export type TagRepository = SlugLookup<Tag>;

export interface SiteSettingsRepository {
  get(): Promise<GlobalSettings>;
}

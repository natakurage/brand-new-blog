import type {
  Album,
  AlbumSummary,
  ArticleMeta,
  ArticleSummary,
  BlogPost,
  GlobalSettings,
  ContentSummary,
  PostList,
  PostListSummary,
  Song,
  SongSummary,
  Tag,
} from "./types";

/*
 * 実装が守る契約
 * - 見つからないときは null を返す
 * - 通信やデータの異常は例外を投げる（null に変換しない）
 * - 戻り値は正規化済み：参照切れの要素は除かれ、必須のフィールドは埋まっている
 */

export type Page<T> = { items: T[]; total: number };

// page は 1 始まり
export type PageRequest = { page: number; size: number };

// preview が true なら下書きを含めて読む
export type ReadContext = { preview: boolean };

export type ArticleListQuery = {
  page: PageRequest;
  slugs?: string[];
  exclude?: string[];
};

export interface SlugLookup<T> {
  findBySlug(slug: string, ctx: ReadContext): Promise<T | null>;
  // 静的生成用。公開済みのもののみを返す
  allSlugs(): Promise<string[]>;
}

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
  containing(articleSlug: string, ctx: ReadContext): Promise<PostListSummary[]>;
}

export interface AlbumRepository extends SlugLookup<Album>, PagedList<AlbumSummary> {
  containing(songSlug: string, ctx: ReadContext): Promise<AlbumSummary[]>;
}

export interface TagRepository extends SlugLookup<Tag> {
  // そのタグが付いたもの（記事・曲・リスト・アルバム）を、新しい順に混ぜて返す
  tagged(tagSlug: string, page: PageRequest, ctx: ReadContext): Promise<Page<ContentSummary>>;
}

export interface SiteSettingsRepository {
  get(): Promise<GlobalSettings>;
}

export interface Repositories {
  articles: ArticleRepository;
  songs: SongRepository;
  postLists: PostListRepository;
  albums: AlbumRepository;
  tags: TagRepository;
  siteSettings: SiteSettingsRepository;
}

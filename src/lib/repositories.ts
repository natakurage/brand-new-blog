import { cacheLife, cacheTag } from "next/cache";
import type { ArticleListQuery, PageRequest, ReadContext, Repositories } from "@/lib/content/repository";
import type { ArticleMeta, Kind } from "@/lib/content/types";
import type { Addressable } from "@/lib/content/href";
import { documentTag, documentsIn, kindTag, siteSettingsTag, tagsFor, type Taggable } from "@/lib/content/cacheTags";
import { source } from "@/lib/source";
import { isPreview } from "@/lib/preview";

// "use cache" の関数が外側の変数を取り込むとキャッシュのキーに入るため、各メソッドをモジュールの最上位の関数として書く

const readContext = async (): Promise<ReadContext> => ({ preview: await isPreview() });

// Next.js の cacheTag は1回に128個までで、超えた分は黙って捨てられる
const maxTags = 128;

const tagWith = (tags: string[], documents: Addressable[] = []) => {
  cacheLife("days");
  cacheTag(...tagsFor(tags, documents, maxTags));
};

const findBySlug = async <T extends Taggable>(
  kind: Kind,
  slug: string,
  find: (slug: string, ctx: ReadContext) => Promise<T | null>,
): Promise<T | null> => {
  const result = await find(slug, await readContext());
  tagWith([documentTag({ kind, slug })], result ? documentsIn(result) : []);
  return result;
};

const allSlugs = async (kind: Kind, all: () => Promise<string[]>): Promise<string[]> => {
  tagWith([kindTag(kind)]);
  return all();
};

const listed = (kind: Kind, items: Taggable[]) => tagWith([kindTag(kind)], items.flatMap(documentsIn));

async function findArticle(slug: string) {
  "use cache";
  return findBySlug("article", slug, source.articles.findBySlug);
}

async function allArticleSlugs() {
  "use cache";
  return allSlugs("article", source.articles.allSlugs);
}

async function listArticles(query: ArticleListQuery) {
  "use cache";
  const page = await source.articles.list(query, await readContext());
  listed("article", page.items);
  return page;
}

async function relatedArticles(article: ArticleMeta, limit: number) {
  "use cache";
  const items = await source.articles.related(article, limit, await readContext());
  listed("article", items);
  return items;
}

// 検索語ごとの結果は再利用されにくく、本文の変更でも結果が変わるため、キャッシュしない
async function searchArticles(text: string, page: PageRequest) {
  return source.articles.search(text, page, await readContext());
}

async function findSong(slug: string) {
  "use cache";
  return findBySlug("song", slug, source.songs.findBySlug);
}

async function allSongSlugs() {
  "use cache";
  return allSlugs("song", source.songs.allSlugs);
}

async function listSongs(page: PageRequest) {
  "use cache";
  const result = await source.songs.list(page, await readContext());
  listed("song", result.items);
  return result;
}

async function findPostList(slug: string) {
  "use cache";
  return findBySlug("postList", slug, source.postLists.findBySlug);
}

async function allPostListSlugs() {
  "use cache";
  return allSlugs("postList", source.postLists.allSlugs);
}

async function listPostLists(page: PageRequest) {
  "use cache";
  const result = await source.postLists.list(page, await readContext());
  listed("postList", result.items);
  return result;
}

async function postListsContaining(articleSlug: string) {
  "use cache";
  const items = await source.postLists.containing(articleSlug, await readContext());
  listed("postList", items);
  return items;
}

async function findAlbum(slug: string) {
  "use cache";
  return findBySlug("album", slug, source.albums.findBySlug);
}

async function allAlbumSlugs() {
  "use cache";
  return allSlugs("album", source.albums.allSlugs);
}

async function listAlbums(page: PageRequest) {
  "use cache";
  const result = await source.albums.list(page, await readContext());
  listed("album", result.items);
  return result;
}

async function albumsContaining(songSlug: string) {
  "use cache";
  const items = await source.albums.containing(songSlug, await readContext());
  listed("album", items);
  return items;
}

async function findTag(slug: string) {
  "use cache";
  return findBySlug("tag", slug, source.tags.findBySlug);
}

async function allTagSlugs() {
  "use cache";
  return allSlugs("tag", source.tags.allSlugs);
}

async function getSiteSettings() {
  "use cache";
  tagWith([siteSettingsTag]);
  return source.siteSettings.get();
}

// プレビューかどうかはこの層が draft mode から決めるので、呼び出し側は ReadContext を渡さない
type WithoutContext<F> = F extends (...args: [...infer A, ReadContext]) => infer R ? (...args: A) => R : F;

export type SiteRepositories = {
  [R in keyof Repositories]: { [M in keyof Repositories[R]]: WithoutContext<Repositories[R][M]> };
};

export const repositories: SiteRepositories = {
  articles: {
    findBySlug: findArticle,
    allSlugs: allArticleSlugs,
    list: listArticles,
    related: relatedArticles,
    search: searchArticles,
  },
  songs: { findBySlug: findSong, allSlugs: allSongSlugs, list: listSongs },
  postLists: {
    findBySlug: findPostList,
    allSlugs: allPostListSlugs,
    list: listPostLists,
    containing: postListsContaining,
  },
  albums: {
    findBySlug: findAlbum,
    allSlugs: allAlbumSlugs,
    list: listAlbums,
    containing: albumsContaining,
  },
  tags: { findBySlug: findTag, allSlugs: allTagSlugs },
  siteSettings: { get: getSiteSettings },
};

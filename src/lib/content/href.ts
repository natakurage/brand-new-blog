import type { BlogPost, Kind } from "./types";

export type Addressable = { kind: Kind; slug: string };

const segments = {
  article: "articles",
  song: "songs",
  postList: "lists",
  album: "albums",
  tag: "tags",
} as const satisfies Record<Kind, string>;

// フレームワークのルートと照合するために型として出す（src/app/routes.test.ts）
export type SegmentOf<K extends Kind> = (typeof segments)[K];

export const hrefOf = (item: Addressable): string => {
  return `/${segments[item.kind]}/${item.slug}`;
};

export const rawFormats = ["md", "txt"] as const;

export type RawFormat = typeof rawFormats[number];

export const rawHref = (article: BlogPost, format: RawFormat): string => {
  return `${hrefOf(article)}.${format}`;
};

// opengraph-image.tsx を置いている種類だけ
export const ogImageHref = (item: Addressable & { kind: "article" | "song" | "album" }): string => {
  return `${hrefOf(item)}/opengraph-image`;
};

export const absoluteUrlOf = (item: Addressable, origin: string): string => {
  return new URL(hrefOf(item), origin).toString();
};

export const pageHref = (base: string, n: number): string => {
  return n === 1 ? base : `${base}/page/${n}`;
};
// どのリスト・アルバムの中で見ているかを表すクエリ。項目そのものの URL は hrefOf のまま
export const listParam = "list";

export const hrefIn = (item: Addressable, collection: Addressable): string => {
  return `${hrefOf(item)}?${new URLSearchParams({ [listParam]: collection.slug })}`;
};

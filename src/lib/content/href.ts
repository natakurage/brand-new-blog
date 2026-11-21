import type { BlogPost, Kind } from "./types";

export type Addressable = { kind: Kind; slug: string };

const segments: Record<Kind, string> = {
  article: "articles",
  song: "songs",
  postList: "lists",
  album: "albums",
  tag: "tags",
};

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
import type { SanityClient } from "next-sanity";
import type { ReadContext } from "@/lib/content/repository";

export type ClientFor = (ctx: ReadContext) => SanityClient;

export const sliceOf = ({ page, size }: { page: number; size: number }) => ({
  start: (page - 1) * size,
  end: page * size,
});

// TODO: キャッシュの設定は adapter の外に出す。それまではタグ名を revalidate ルートと揃えておく必要がある
export const cacheFor = (tags: string[], revalidate: number) => ({
  next: { tags, revalidate },
});

export const DAY = 86400;

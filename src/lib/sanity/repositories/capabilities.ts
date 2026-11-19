import type { PagedList, SlugLookup } from "@/lib/content/repository";
import { cacheFor, DAY, sliceOf, type ClientFor } from "../fetchOptions";

export const slugLookup = <E, T>(
  clientFor: ClientFor,
  { cacheTag, bySlugQuery, slugsQuery, map }: {
    cacheTag: string;
    bySlugQuery: string;
    slugsQuery: string;
    map: (entry: E) => T;
  },
): SlugLookup<T> => ({
  async findBySlug(slug, ctx) {
    const entry = await clientFor(ctx).fetch<E | null>(
      bySlugQuery,
      { slug },
      cacheFor([cacheTag, `${cacheTag}:slug:${slug}`], DAY),
    );
    return entry ? map(entry) : null;
  },

  async allSlugs() {
    return clientFor({ preview: false }).fetch<string[]>(slugsQuery, {}, cacheFor([], 10));
  },
});

export const pagedList = <E, S>(
  clientFor: ClientFor,
  { cacheTag, listQuery, map }: {
    cacheTag: string;
    listQuery: string;
    map: (entry: E) => S;
  },
): PagedList<S> => ({
  async list(page, ctx) {
    const result = await clientFor(ctx).fetch<{ items: E[]; total: number }>(
      listQuery,
      sliceOf(page),
      cacheFor([cacheTag, `${cacheTag}-collection`], DAY),
    );
    return { items: result.items.map(map), total: result.total };
  },
});

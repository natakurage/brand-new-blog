import type { PagedList, SlugLookup } from "@/lib/content/repository";
import { sliceOf, type ClientFor } from "../fetchOptions";

export const slugLookup = <E, T>(
  clientFor: ClientFor,
  { bySlugQuery, slugsQuery, map }: {
    bySlugQuery: string;
    slugsQuery: string;
    map: (entry: E) => T;
  },
): SlugLookup<T> => ({
  async findBySlug(slug, ctx) {
    const entry = await clientFor(ctx).fetch<E | null>(bySlugQuery, { slug });
    return entry ? map(entry) : null;
  },

  async allSlugs() {
    return clientFor({ preview: false }).fetch<string[]>(slugsQuery);
  },
});

export const pagedList = <E, S>(
  clientFor: ClientFor,
  { listQuery, map }: {
    listQuery: string;
    map: (entry: E) => S;
  },
): PagedList<S> => ({
  async list(page, ctx) {
    const result = await clientFor(ctx).fetch<{ items: E[]; total: number }>(listQuery, sliceOf(page));
    return { items: result.items.map(map), total: result.total };
  },
});

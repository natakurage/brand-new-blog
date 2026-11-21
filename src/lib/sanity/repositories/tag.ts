import type { TagRepository } from "@/lib/content/repository";
import type { ContentKind } from "@/lib/content/types";
import { taggedAddressesQuery, taggedListQuery, tagBySlugQuery, tagSlugsQuery } from "../queries";
import { toAddress, toContentSummary, toTag } from "../mappers";
import type { SanityEntryOf } from "../kinds";
import { sliceOf, type ClientFor } from "../fetchOptions";
import { slugLookup } from "./capabilities";

export const createSanityTagRepository = (clientFor: ClientFor): TagRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: tagBySlugQuery, slugsQuery: tagSlugsQuery, map: toTag }),

  async tagged(tagSlug, page, ctx) {
    const result = await clientFor(ctx).fetch<{ items: SanityEntryOf[ContentKind][]; total: number }>(
      taggedListQuery,
      { tagSlug, ...sliceOf(page) },
    );
    return { items: result.items.map(toContentSummary), total: result.total };
  },

  async taggedAddresses(tagSlug, ctx) {
    const entries = await clientFor(ctx).fetch<{ _type: string; slug: string }[]>(taggedAddressesQuery, { tagSlug });
    return entries.map(toAddress);
  },
});

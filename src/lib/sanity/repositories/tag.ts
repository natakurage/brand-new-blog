import type { TagRepository } from "@/lib/content/repository";
import type { ContentSummary } from "@/lib/content/types";
import { taggedListQuery, tagBySlugQuery, tagSlugsQuery } from "../queries";
import { toAlbumSummary, toArticleSummary, toPostListSummary, toSongSummary, toTag } from "../mappers";
import type { SanityBlogPostResolved, SanityMusicAlbumResolved, SanityPostListResolved, SanitySongResolved } from "../types";
import { sliceOf, type ClientFor } from "../fetchOptions";
import { slugLookup } from "./capabilities";

type TaggedEntry = SanityBlogPostResolved | SanitySongResolved | SanityPostListResolved | SanityMusicAlbumResolved;

const toSummary = (entry: TaggedEntry): ContentSummary => {
  switch (entry._type) {
    case "blogPost":
      return toArticleSummary(entry);
    case "song":
      return toSongSummary(entry);
    case "postList":
      return toPostListSummary(entry);
    case "musicAlbum":
      return toAlbumSummary(entry);
    default:
      return entry satisfies never;
  }
};

export const createSanityTagRepository = (clientFor: ClientFor): TagRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: tagBySlugQuery, slugsQuery: tagSlugsQuery, map: toTag }),

  async tagged(tagSlug, page, ctx) {
    const result = await clientFor(ctx).fetch<{ items: TaggedEntry[]; total: number }>(taggedListQuery, { tagSlug, ...sliceOf(page) });
    return { items: result.items.map(toSummary), total: result.total };
  },
});

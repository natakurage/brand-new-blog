import type { PostListRepository } from "@/lib/content/repository";
import { postListBySlugQuery, postListListQuery, postListSlugsQuery, postListsContainingQuery } from "../queries";
import { toPostList, toPostListSummary } from "../mappers";
import type { SanityPostListResolved } from "../types";
import { cacheFor, type ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

const cacheTag = "postList";

export const createSanityPostListRepository = (clientFor: ClientFor): PostListRepository => ({
  ...slugLookup(clientFor, { cacheTag, bySlugQuery: postListBySlugQuery, slugsQuery: postListSlugsQuery, map: toPostList }),
  ...pagedList(clientFor, { cacheTag, listQuery: postListListQuery, map: toPostListSummary }),

  async containing(articleSlug, ctx) {
    const entries = await clientFor(ctx).fetch<SanityPostListResolved[]>(
      postListsContainingQuery,
      { articleSlug },
      cacheFor([], 10),
    );
    return entries.map(toPostListSummary);
  },
});

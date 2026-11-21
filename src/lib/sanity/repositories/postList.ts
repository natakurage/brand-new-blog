import type { PostListRepository } from "@/lib/content/repository";
import { postListBySlugQuery, postListListQuery, postListSlugsQuery, postListsContainingQuery } from "../queries";
import { toPostList, toPostListSummary } from "../mappers";
import type { SanityPostListResolved } from "../types";
import type { ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

export const createSanityPostListRepository = (clientFor: ClientFor): PostListRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: postListBySlugQuery, slugsQuery: postListSlugsQuery, map: toPostList }),
  ...pagedList(clientFor, { listQuery: postListListQuery, map: toPostListSummary }),

  async containing(articleSlug, ctx) {
    const entries = await clientFor(ctx).fetch<SanityPostListResolved[]>(postListsContainingQuery, { articleSlug });
    return entries.map(toPostListSummary);
  },
});

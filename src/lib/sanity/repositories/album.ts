import type { AlbumRepository } from "@/lib/content/repository";
import { albumBySlugQuery, albumListQuery, albumSlugsQuery, albumsContainingQuery } from "../queries";
import { toAlbum, toAlbumSummary } from "../mappers";
import type { SanityMusicAlbumResolved } from "../types";
import { cacheFor, type ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

const cacheTag = "musicAlbum";

export const createSanityAlbumRepository = (clientFor: ClientFor): AlbumRepository => ({
  ...slugLookup(clientFor, { cacheTag, bySlugQuery: albumBySlugQuery, slugsQuery: albumSlugsQuery, map: toAlbum }),
  ...pagedList(clientFor, { cacheTag, listQuery: albumListQuery, map: toAlbumSummary }),

  async containing(songSlug, ctx) {
    const entries = await clientFor(ctx).fetch<SanityMusicAlbumResolved[]>(
      albumsContainingQuery,
      { songSlug },
      cacheFor([], 10),
    );
    return entries.map(toAlbumSummary);
  },
});

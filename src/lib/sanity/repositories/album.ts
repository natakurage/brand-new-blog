import type { AlbumRepository } from "@/lib/content/repository";
import { albumBySlugQuery, albumListQuery, albumSlugsQuery, albumsContainingQuery } from "../queries";
import { toAlbum, toAlbumSummary } from "../mappers";
import type { SanityMusicAlbumResolved } from "../types";
import type { ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

export const createSanityAlbumRepository = (clientFor: ClientFor): AlbumRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: albumBySlugQuery, slugsQuery: albumSlugsQuery, map: toAlbum }),
  ...pagedList(clientFor, { listQuery: albumListQuery, map: toAlbumSummary }),

  async containing(songSlug, ctx) {
    const entries = await clientFor(ctx).fetch<SanityMusicAlbumResolved[]>(albumsContainingQuery, { songSlug });
    return entries.map(toAlbumSummary);
  },
});

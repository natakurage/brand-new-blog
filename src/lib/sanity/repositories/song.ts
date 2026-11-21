import type { SongRepository } from "@/lib/content/repository";
import { songAddressesQuery, songBySlugQuery, songListQuery, songSlugsQuery } from "../queries";
import { toAddress, toSong, toSongSummary } from "../mappers";
import type { ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

export const createSanitySongRepository = (clientFor: ClientFor): SongRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: songBySlugQuery, slugsQuery: songSlugsQuery, map: toSong }),
  ...pagedList(clientFor, { listQuery: songListQuery, map: toSongSummary }),

  async addresses(ctx) {
    const entries = await clientFor(ctx).fetch<{ _type: string; slug: string }[]>(songAddressesQuery);
    return entries.map(toAddress);
  },
});

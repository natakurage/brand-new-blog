import type { SongRepository } from "@/lib/content/repository";
import { songBySlugQuery, songListQuery, songSlugsQuery } from "../queries";
import { toSong, toSongSummary } from "../mappers";
import type { ClientFor } from "../fetchOptions";
import { pagedList, slugLookup } from "./capabilities";

export const createSanitySongRepository = (clientFor: ClientFor): SongRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: songBySlugQuery, slugsQuery: songSlugsQuery, map: toSong }),
  ...pagedList(clientFor, { listQuery: songListQuery, map: toSongSummary }),
});

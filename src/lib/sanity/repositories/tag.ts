import type { TagRepository } from "@/lib/content/repository";
import { tagBySlugQuery, tagSlugsQuery } from "../queries";
import { toTag } from "../mappers";
import type { ClientFor } from "../fetchOptions";
import { slugLookup } from "./capabilities";

export const createSanityTagRepository = (clientFor: ClientFor): TagRepository =>
  slugLookup(clientFor, { bySlugQuery: tagBySlugQuery, slugsQuery: tagSlugsQuery, map: toTag });

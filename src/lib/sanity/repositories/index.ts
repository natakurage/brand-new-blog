import type { Repositories } from "@/lib/content/repository";
import type { ClientFor } from "../fetchOptions";
import { createSanityArticleRepository } from "./article";
import { createSanitySongRepository } from "./song";
import { createSanityPostListRepository } from "./postList";
import { createSanityAlbumRepository } from "./album";
import { createSanityTagRepository } from "./tag";
import { createSanitySiteSettingsRepository } from "./siteSettings";

export const createSanityRepositories = (clientFor: ClientFor): Repositories => ({
  articles: createSanityArticleRepository(clientFor),
  songs: createSanitySongRepository(clientFor),
  postLists: createSanityPostListRepository(clientFor),
  albums: createSanityAlbumRepository(clientFor),
  tags: createSanityTagRepository(clientFor),
  siteSettings: createSanitySiteSettingsRepository(clientFor),
});

import type { SiteSettingsRepository } from "@/lib/content/repository";
import { linkListsQuery, siteSettingsQuery } from "../queries";
import { linkListIds, toSiteSettings } from "../mappers";
import type { SanityGlobalSettingsResolved, SanityLinkListResolved } from "../types";
import { cacheFor, DAY, type ClientFor } from "../fetchOptions";

export const createSanitySiteSettingsRepository = (clientFor: ClientFor): SiteSettingsRepository => ({
  async get() {
    const client = clientFor({ preview: false });
    const [gs, linkLists] = await Promise.all([
      client.fetch<SanityGlobalSettingsResolved>(siteSettingsQuery),
      client.fetch<SanityLinkListResolved[]>(
        linkListsQuery,
        { ids: Object.values(linkListIds) },
        cacheFor(["globalSettings"], DAY),
      ),
    ]);
    return toSiteSettings(gs, linkLists);
  },
});

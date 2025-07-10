import { getClient } from "./client";
import { unstable_cache } from "next/cache";
import { GlobalSettings, LinkItem } from "./models";
import { TypeGlobalSettingsSkeleton, TypeLinkListSkeleton } from "../../@types/contentful";

export const loadGlobalSettings = unstable_cache(fetchGlobalSettings, ["globalSettings"], {
  tags: ["globalSettings"],
  revalidate: 60 * 60, // 1 hour
});

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  const client = getClient(false);
  const gsEntries = await client.getEntries<TypeGlobalSettingsSkeleton>({
    content_type: "globalSettings",
    limit: 1,
    include: 1,
  });
  const entry = gsEntries.items[0];
  const fields = entry.fields;
  const includesAssets = gsEntries.includes?.Asset ?? [];
  const avatarId = fields.avatar?.sys.id;
  const topLogoId = fields.topLogo?.sys.id;
  const bannerId = fields.banner?.sys.id;
  const faviconId = fields.favicon?.sys.id;
  const appleTouchIconId = fields.appleTouchIcon?.sys.id;

  const llEntries = await client.getEntries<TypeLinkListSkeleton>({
    content_type: "linkList",
    "fields.id[in]": ["socials", "navbarPages", "footerPages"],
  });
  const llIncludes = llEntries.includes?.Entry ?? [];
  const socialsEntry = llEntries.items.find(item => item.fields.id === "socials");
  const navbarPagesEntry = llEntries.items.find(item => item.fields.id === "navbarPages");
  const footerPagesEntry = llEntries.items.find(item => item.fields.id === "footerPages");

  const toHrefItem = (id: string) : LinkItem => {
    const item = llIncludes.find(item => item.sys.id === id);
    const _name = item?.fields.name;
    const _href = item?.fields.href;
    const name = (typeof _name === "string") ? _name : (_name?.toString() ?? "");
    const href = (typeof _href === "string") ? _href : (_href?.toString() ?? "");
    return { name, href };
  };

  const avatarUrl = includesAssets.find(asset => asset.sys.id === avatarId)?.fields.file?.url;
  const topLogoUrl = includesAssets.find(asset => asset.sys.id === topLogoId)?.fields.file?.url;
  const bannerUrl = includesAssets.find(asset => asset.sys.id === bannerId)?.fields.file?.url;
  const faviconUrl = includesAssets.find(asset => asset.sys.id === faviconId)?.fields.file?.url;
  const appleTouchIconUrl = includesAssets.find(asset => asset.sys.id === appleTouchIconId)?.fields.file?.url;

  return {
    siteName: fields.siteName,
    description: fields.description ?? "",
    author: fields.author,
    authorUrl: fields.authorUrl,
    copyright: fields.copyright ?? "Copyright © " + new Date().getFullYear() + " " + fields.author,
    donate: fields.donate,
    donateUrl: fields.donateUrl,
    bio: fields.bio ?? "",
    contactUrl: fields.contactUrl,
    useSidebar: fields.useSidebar,
    adblock: fields.adblock,
    showRelatedPosts: fields.showRelatedPosts,
    showNewPosts: fields.showNewPosts,
    recommendedPosts: fields.recommendedPosts ?? [],
    socials: socialsEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    navbarPages: navbarPagesEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    footerPages: footerPagesEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    avatar: "https:" + avatarUrl,
    topLogo: "https:" + topLogoUrl,
    banner: "https:" + bannerUrl,
    favicon: "https:" + faviconUrl,
    appleTouchIcon: "https:" + appleTouchIconUrl,
  };
}
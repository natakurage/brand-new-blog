import { getClient } from "./client";
import { GlobalSettings, LinkItem } from "@/lib/models";
import type {
  GlobalSettings as SanityGlobalSettings,
  LinkItem as SanityLinkItem,
  LinkList as SanityLinkList
} from "../../../@types/sanity/sanity.types";
import { ResolveReferences } from "./types";
import { groq } from "next-sanity";

type SanityGlobalSettingsResolved = ResolveReferences<
  SanityGlobalSettings,
  {
    avatar: string;
    topLogo: string;
    banner: string;
    favicon: string;
    appleTouchIcon: string;
    description: string;
    bio: string;
  }
>;

type SanityLinkListResolved = ResolveReferences<SanityLinkList, {
  item: SanityLinkItem[]
}>;

const TransformLinkItems = (items: SanityLinkItem[]): LinkItem[] => {
  return items.map((item) => ({
    href: item.href ?? "#",
    name: item.name ?? "Unnamed Link"
  })).filter(Boolean);
};

export async function loadGlobalSettings(): Promise<GlobalSettings> {
  const client = getClient(false);
  
  const q = groq`*[_type == "globalSettings"][0]{
    ...,
    "avatar": avatar.asset->url,
    "topLogo": topLogo.asset->url,
    "banner": banner.asset->url,
    "favicon": favicon.asset->url,
    "appleTouchIcon": appleTouchIcon.asset->url,
    "description": description,
    "bio": bio
  }`;
  const gs = await client.fetch<SanityGlobalSettingsResolved>(q);

  const socialsKey = "socials";
  const navbarPagesKey = "navbar-pages";
  const footerPagesKey = "footer-pages";

  const q2 = groq`*[_type == "linkList" && id.current in [$socialsKey, $navbarPagesKey, $footerPagesKey]]{ ..., "item": item[]-> }`;
  const linkLists = await client.fetch<SanityLinkListResolved[]>(q2, {
    socialsKey,
    navbarPagesKey,
    footerPagesKey,
  }, 
  {
    next: {
      tags: ["globalSettings"],
      revalidate: 86400, // 1 day
    }
  });
  const socials = linkLists.find(item => item.id?.current === socialsKey);
  const navbarPages = linkLists.find(item => item.id?.current === navbarPagesKey);
  const footerPages = linkLists.find(item => item.id?.current === footerPagesKey);

  return {
    siteName: gs.siteName ?? "Unnamed Blog",
    description: gs.description ?? "",
    author: gs.author ?? "Unknown Author",
    authorUrl: gs.authorUrl,
    copyright: gs.copyright ?? "Copyright © " + new Date().getFullYear() + " " + gs.author,
    donate: gs.donate,
    donateUrl: gs.donateUrl,
    bio: gs.bio ?? "",
    contactUrl: gs.contactUrl,
    useSidebar: gs.useSidebar ?? false,
    adblock: gs.adblock ?? false,
    showRelatedPosts: gs.showRelatedPosts ?? false,
    showNewPosts: gs.showNewPosts ?? false,
    itemsPerPage: gs.itemsPerPage ?? 10,
    recommendedPosts: gs.recommendedPosts ?? [],
    socials: TransformLinkItems(socials?.item ?? []),
    navbarPages: TransformLinkItems(navbarPages?.item ?? []),
    footerPages: TransformLinkItems(footerPages?.item ?? []),
    avatar: gs.avatar,
    topLogo: gs.topLogo,
    banner: gs.banner,
    favicon: gs.favicon,
    appleTouchIcon: gs.appleTouchIcon,
  };
}
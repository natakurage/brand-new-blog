import { getClient } from "./client";
import { unstable_cache } from "next/cache";
import { GlobalSettings } from "@/lib/models";
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

export const loadGlobalSettings = unstable_cache(fetchGlobalSettings, ["globalSettings"], {
  tags: ["globalSettings"],
  revalidate: 60 * 60, // 1 hour
});

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
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

  const q2 = groq`*[_type == "linkList" && id.current in ["socials", "navbarPages", "footerPages"]]{ ..., "item": item[]-> }`;
  const linkLists = await client.fetch<SanityLinkListResolved[]>(q2);
  const socials = linkLists.find(item => item.id.current === "socials");
  const navbarPages = linkLists.find(item => item.id.current === "navbarPages");
  const footerPages = linkLists.find(item => item.id.current === "footerPages");

  return {
    siteName: gs.siteName,
    description: gs.description ?? "",
    author: gs.author,
    authorUrl: gs.authorUrl,
    copyright: gs.copyright ?? "Copyright © " + new Date().getFullYear() + " " + gs.author,
    donate: gs.donate,
    donateUrl: gs.donateUrl,
    bio: gs.bio ?? "",
    contactUrl: gs.contactUrl,
    useSidebar: gs.useSidebar,
    adblock: gs.adblock,
    showRelatedPosts: gs.showRelatedPosts,
    showNewPosts: gs.showNewPosts,
    recommendedPosts: gs.recommendedPosts ?? [],
    socials: socials?.item ?? [],
    navbarPages: navbarPages?.item ?? [],
    footerPages: footerPages?.item ?? [],
    avatar: gs.avatar,
    topLogo: gs.topLogo,
    banner: gs.banner,
    favicon: gs.favicon,
    appleTouchIcon: gs.appleTouchIcon,
  };
}
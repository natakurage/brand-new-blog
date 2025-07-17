import { getClient } from "./client";
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
  const socials = linkLists.find(item => item.id.current === socialsKey);
  const navbarPages = linkLists.find(item => item.id.current === navbarPagesKey);
  const footerPages = linkLists.find(item => item.id.current === footerPagesKey);

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
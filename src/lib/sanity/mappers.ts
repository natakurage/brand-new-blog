import type { LinkItem as SanityLinkItem, Tag as SanityTag } from "../../../@types/sanity/sanity.types";
import type {
  Album,
  AlbumMeta,
  AlbumSummary,
  ArticleMeta,
  ArticleSummary,
  BlogPost,
  ContentKind,
  ContentSummary,
  GlobalSettings,
  LinkItem,
  PostList,
  PostListMeta,
  PostListSummary,
  Song,
  SongMeta,
  SongSummary,
  Tag,
} from "@/lib/content/types";
import type { CcLicenseId, License } from "@/lib/content/license";
import { digestOf } from "@/lib/content/summary";
import type {
  SanityBlogPostResolved,
  SanityGlobalSettingsResolved,
  SanityLinkListResolved,
  SanityMusicAlbumResolved,
  SanityPostListResolved,
  SanitySongResolved,
} from "./types";
import { kindOfSanityType, type SanityEntryOf } from "./kinds";
import type { Addressable } from "@/lib/content/href";

// Sanity の文書の形を知っているのは、このファイルと queries.ts だけにする

// slug のない文書はクエリで除いているので、ここに届くのはクエリの誤り
const slugOf = (doc: { _id: string; slug?: { current?: string } }): string => {
  const slug = doc.slug?.current;
  if (!slug) {
    throw new Error(`slug のない文書がクエリから届いた: ${doc._id}`);
  }
  return slug;
};

export const toTag = (tag: SanityTag): Tag => ({
  kind: "tag",
  slug: slugOf(tag),
  name: tag.name ?? "Unnamed Tag",
  contentWarning: tag.contentWarning
});

export const toTags = (tags?: (SanityTag | null)[]): Tag[] => {
  return tags?.filter((tag) => tag !== null).map(toTag) ?? [];
};

export const toLicense = (licenseSelect?: CcLicenseId, license?: string): License => {
  if (licenseSelect) {
    return { kind: "cc", id: licenseSelect };
  } else if (license) {
    return { kind: "custom", text: license };
  } else {
    return { kind: "unspecified" };
  }
};

const toArticleMeta = (entry: SanityBlogPostResolved): ArticleMeta => ({
  kind: "article",
  title: entry.title ?? "Untitled Article",
  slug: slugOf(entry),
  mainImage: entry.image,
  description: entry.description,
  createdAt: new Date(entry._createdAt),
  updatedAt: new Date(entry._updatedAt),
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
});

export const toArticleSummary = (entry: SanityBlogPostResolved): ArticleSummary => ({
  ...toArticleMeta(entry),
  ...digestOf(entry.body ?? ""),
});

export const toBlogPost = (entry: SanityBlogPostResolved): BlogPost => ({
  ...toArticleSummary(entry),
  content: entry.body ?? "",
});

const toSongMeta = (entry: SanitySongResolved): SongMeta => ({
  kind: "song",
  title: entry.title ?? "Untitled Song",
  slug: slugOf(entry),
  createdAt: new Date(entry._createdAt),
  updatedAt: new Date(entry._updatedAt),
  artist: entry.artist ?? [],
  credit: entry.credit ?? [],
  releaseDate: entry.releaseDate,
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
  url: entry.url ?? [],
  streamUrl: entry.streamUrl,
});

// CMS の曲の description は長い Markdown で、本文にあたるため content に入れる
export const toSongSummary = (entry: SanitySongResolved): SongSummary => ({
  ...toSongMeta(entry),
  ...digestOf(entry.description ?? ""),
});

export const toSong = (entry: SanitySongResolved): Song => ({
  ...toSongSummary(entry),
  content: entry.description ?? "",
  lyrics: entry.lyrics,
});

const toPostListMeta = (entry: SanityPostListResolved): PostListMeta => ({
  kind: "postList",
  title: entry.title ?? "Untitled List",
  slug: slugOf(entry),
  description: entry.description,
  tags: toTags(entry.tags),
});

export const toPostList = (entry: SanityPostListResolved): PostList => {
  const items = (entry.posts ?? []).filter((post) => post !== null).map(toArticleSummary);
  return {
    ...toPostListMeta(entry),
    items: entry.inverted ? items.toReversed() : items,
  };
};

export const toPostListSummary = (entry: SanityPostListResolved): PostListSummary => toPostListMeta(entry);

const toAlbumMeta = (entry: SanityMusicAlbumResolved): AlbumMeta => ({
  kind: "album",
  title: entry.title ?? "Untitled Album",
  slug: slugOf(entry),
  description: entry.description,
  createdAt: new Date(entry._createdAt),
  updatedAt: new Date(entry._updatedAt),
  releaseDate: entry.releaseDate,
  artist: entry.artist ?? [],
  credit: entry.credit ?? [],
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
});

export const toAlbum = (entry: SanityMusicAlbumResolved): Album => ({
  ...toAlbumMeta(entry),
  items: (entry.tracks ?? []).filter((track) => track !== null).map(toSongSummary),
});

export const toAlbumSummary = (entry: SanityMusicAlbumResolved): AlbumSummary => toAlbumMeta(entry);

export const toAddress = ({ _type, slug }: { _type: string; slug: string }): Addressable => {
  const kind = kindOfSanityType.get(_type);
  if (!kind) {
    throw new Error(`種類に翻訳できない型の文書が届いた: ${_type}`);
  }
  return { kind, slug };
};

// 型を問わず取ってきた文書を要約に翻訳する。変換を持たない型の文書が来たら例外にする
export const toContentSummary = (entry: SanityEntryOf[ContentKind]): ContentSummary => {
  switch (entry._type) {
    case "blogPost":
      return toArticleSummary(entry);
    case "song":
      return toSongSummary(entry);
    case "postList":
      return toPostListSummary(entry);
    case "musicAlbum":
      return toAlbumSummary(entry);
    default: {
      const unsupported: never = entry;
      throw new Error(`要約に翻訳できない型の文書が届いた: ${(unsupported as { _type: string })._type}`);
    }
  }
};

export const linkListIds = {
  socials: "socials",
  navbarPages: "navbar-pages",
  footerPages: "footer-pages",
} as const;

const toLinkItems = (list?: SanityLinkListResolved): LinkItem[] => {
  return (list?.item ?? [])
    .filter((item): item is SanityLinkItem => item !== null)
    .map((item) => ({
      href: item.href ?? "#",
      name: item.name ?? "Unnamed Link",
    }));
};

export const toSiteSettings = (gs: SanityGlobalSettingsResolved, linkLists: SanityLinkListResolved[]): GlobalSettings => {
  const linkList = (id: string) => linkLists.find((list) => list.id?.current === id);
  const author = gs.author ?? "Unknown Author";
  return {
    siteName: gs.siteName ?? "Unnamed Blog",
    description: gs.description ?? "",
    author,
    authorUrl: gs.authorUrl,
    copyright: gs.copyright ?? author,
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
    socials: toLinkItems(linkList(linkListIds.socials)),
    navbarPages: toLinkItems(linkList(linkListIds.navbarPages)),
    footerPages: toLinkItems(linkList(linkListIds.footerPages)),
    avatar: gs.avatar,
    topLogo: gs.topLogo,
    banner: gs.banner,
    favicon: gs.favicon,
    appleTouchIcon: gs.appleTouchIcon,
  };
};

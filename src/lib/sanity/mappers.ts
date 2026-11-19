import type { Tag as SanityTag } from "../../../@types/sanity/sanity.types";
import type {
  Album,
  AlbumMeta,
  AlbumSummary,
  ArticleMeta,
  ArticleSummary,
  BlogPost,
  PostList,
  PostListMeta,
  PostListSummary,
  Song,
  SongMeta,
  SongSummary,
  Tag,
} from "@/lib/content/types";
import type { CcLicenseId, License } from "@/lib/content/license";
import { summarize } from "@/lib/content/summary";
import type {
  SanityBlogPostResolved,
  SanityMusicAlbumResolved,
  SanityPostListResolved,
  SanitySongResolved,
} from "./types";

// Sanity の文書をドメインの型に変換する。Sanity の形を知っているのはこのファイルと queries だけにする

export const toTag = (tag: SanityTag): Tag => ({
  kind: "tag",
  slug: tag.slug?.current ?? "",
  name: tag.name ?? "Unnamed Tag",
  contentWarning: tag.contentWarning
});

export const toTags = (tags?: (SanityTag | null)[]): Tag[] => {
  return tags?.filter((tag) => tag !== null).map(toTag) ?? [];
};

// licenseSelect（CC）と license（自由記述）が両方あれば CC を優先する
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
  id: entry._id,
  title: entry.title ?? "Untitled Article",
  slug: entry.slug?.current ?? "",
  mainImage: entry.image,
  description: entry.description ?? "",
  createdAt: new Date(entry._createdAt),
  updatedAt: new Date(entry._updatedAt),
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
  showToc: entry.showToc,
});

export const toBlogPost = (entry: SanityBlogPostResolved): BlogPost => ({
  ...toArticleMeta(entry),
  content: entry.body ?? "",
});

export const toArticleSummary = (entry: SanityBlogPostResolved): ArticleSummary => ({
  ...toArticleMeta(entry),
  ...summarize(entry.body ?? ""),
});

const toSongMeta = (entry: SanitySongResolved): SongMeta => ({
  kind: "song",
  id: entry._id,
  title: entry.title ?? "Untitled Song",
  slug: entry.slug?.current ?? "",
  createdAt: new Date(entry._createdAt),
  updatedAt: new Date(entry._updatedAt),
  artist: entry.artist ?? [],
  credit: entry.credit,
  releaseDate: entry.releaseDate,
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
  url: entry.url,
  streamUrl: entry.streamUrl,
});

// CMS の曲の description は長い Markdown で、意味としては本文にあたる。
// そのためドメインでは content に入れ、短い説明文の description は持たない
export const toSong = (entry: SanitySongResolved): Song => ({
  ...toSongMeta(entry),
  content: entry.description ?? "",
  lyrics: entry.lyrics,
});

export const toSongSummary = (entry: SanitySongResolved): SongSummary => ({
  ...toSongMeta(entry),
  ...summarize(entry.description ?? ""),
});

const toPostListMeta = (entry: SanityPostListResolved): PostListMeta => ({
  kind: "postList",
  id: entry._id,
  title: entry.title ?? "Untitled List",
  slug: entry.slug?.current ?? "",
  description: entry.description,
  tags: toTags(entry.tags),
  inverted: entry.inverted ?? false,
});

export const toPostList = (entry: SanityPostListResolved): PostList => ({
  ...toPostListMeta(entry),
  items: entry.posts.map(toBlogPost),
});

export const toPostListSummary = (entry: SanityPostListResolved): PostListSummary => toPostListMeta(entry);

const toAlbumMeta = (entry: SanityMusicAlbumResolved): AlbumMeta => ({
  kind: "album",
  id: entry._id,
  title: entry.title ?? "Untitled Album",
  slug: entry.slug?.current ?? "",
  description: entry.description,
  releaseDate: entry.releaseDate,
  artist: entry.artist,
  credit: entry.credit,
  tags: toTags(entry.tags),
  license: toLicense(entry.licenseSelect, entry.license),
});

export const toAlbum = (entry: SanityMusicAlbumResolved): Album => ({
  ...toAlbumMeta(entry),
  items: entry.tracks.map(toSong),
});

export const toAlbumSummary = (entry: SanityMusicAlbumResolved): AlbumSummary => toAlbumMeta(entry);

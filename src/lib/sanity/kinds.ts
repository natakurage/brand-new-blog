import type { Kind } from "@/lib/content/types";
import type { Tag as SanityTag } from "../../../@types/sanity/sanity.types";
import type { SanityBlogPostResolved, SanityMusicAlbumResolved, SanityPostListResolved, SanitySongResolved } from "./types";

// ドメインの種類ごとの、参照を解決した Sanity の文書の型
export type SanityEntryOf = {
  article: SanityBlogPostResolved;
  song: SanitySongResolved;
  postList: SanityPostListResolved;
  album: SanityMusicAlbumResolved;
  tag: SanityTag;
};

// 種類と Sanity の型名の対応の正本。型名は文書の型の _type と照合される
export const sanityTypeOf: { [K in Kind]: SanityEntryOf[K]["_type"] } = {
  article: "blogPost",
  song: "song",
  postList: "postList",
  album: "musicAlbum",
  tag: "tag",
};

export const kindOfSanityType = new Map<string, Kind>(
  Object.entries(sanityTypeOf).map(([kind, type]) => [type, kind as Kind]),
);

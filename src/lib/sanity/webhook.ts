import type { Kind } from "@/lib/content/types";

export const kindOfSanityType = {
  blogPost: "article",
  song: "song",
  postList: "postList",
  musicAlbum: "album",
} as const satisfies Record<string, Kind>;

export const isSanityContentType = (type: string): type is keyof typeof kindOfSanityType => {
  return type in kindOfSanityType;
};

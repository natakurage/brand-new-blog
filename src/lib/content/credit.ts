import type { BlogPost, Song } from "./types";
import { getAbsoluteUrl } from "./href";
import { licenseLabel } from "./license";

export const getCreditText = (item: BlogPost, author: string, origin: string): string => {
  const creditInfo = new Map<string, string>([
    ["タイトル", item.title],
    ["著者", author],
    ["作成年", item.createdAt.getFullYear().toString()],
    ["URL", getAbsoluteUrl(item, origin)],
    ["ライセンス", licenseLabel(item.license)],
  ]);
  return Array.from(creditInfo.entries())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
};

export const getSongCreditText = (song: Song, origin: string): string => {
  const creditInfo = new Map<string, string>([
    ["タイトル", song.title],
    ["アーティスト", song.artist.join(", ")]
  ]);
  song.credit?.forEach((credit) => {
    const [k, v] = credit.split(":");
    creditInfo.set(k, v);
  });
  ([
    ["作成年", song.createdAt.getFullYear().toString()],
    ["URL", getAbsoluteUrl(song, origin)],
    ["ライセンス", licenseLabel(song.license)],
  ]).forEach(([k, v]) => creditInfo.set(k, v));
  return Array.from(creditInfo.entries())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
};

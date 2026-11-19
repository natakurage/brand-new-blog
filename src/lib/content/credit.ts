import type { BlogPost, Song } from "./types";
import { getShareInfo } from "./share";
import { loadGlobalSettings } from "@/lib/cms";

export const getCreditText = async (item: BlogPost): Promise<string> => {
  const [data, shareInfo] = await Promise.all([
    loadGlobalSettings(),
    getShareInfo(item),
  ]);
  const creditInfo = new Map<string, string>([
    ["タイトル", item.title],
    ["著者", data.author],
    ["作成年", new Date(item.createdAt).getFullYear().toString()],
    ["URL", shareInfo.url],
    ["ライセンス", item.licenseSelect ?? item.license ?? "不明なライセンス"],
  ]);
  return Array.from(creditInfo.entries())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
};

export const getSongCreditText = async (song: Song): Promise<string> => {
  const shareInfo = await getShareInfo(song);
  const creditInfo = new Map<string, string>([
    ["タイトル", song.title],
    ["アーティスト", song.artist.join(", ")]
  ]);
  song.credit?.forEach((credit) => {
    const [k, v] = credit.split(":");
    creditInfo.set(k, v);
  });
  ([
    ["作成年", new Date(song.createdAt).getFullYear().toString()],
    ["URL", shareInfo.url],
    ["ライセンス", song.licenseSelect ?? song.license ?? "不明なライセンス"],
  ]).forEach(([k, v]) => creditInfo.set(k, v));
  return Array.from(creditInfo.entries())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
};

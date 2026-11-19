import type { BlogData } from "./types";
import { loadGlobalSettings } from "@/lib/cms";

interface ShareInfo {
  text: string;
  url: string;
}

export const getShareInfo = async (item: BlogData): Promise<ShareInfo> => {
  const origin = process.env.NEXT_PUBLIC_ORIGIN;
  if (!origin) {
    throw new Error("Missing NEXT_PUBLIC_ORIGIN");
  }

  const data = await loadGlobalSettings();

  return {
    text: `${item.title} - ${data.siteName}`,
    url: `${origin}/${item.typeUrl}/${item.slug}`
  };
};

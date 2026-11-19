import type { BlogData } from "./types";
import { getAbsoluteUrl } from "./href";

interface ShareInfo {
  text: string;
  url: string;
}

export const getShareInfo = (item: BlogData, siteName: string, origin: string): ShareInfo => {
  return {
    text: `${item.title} - ${siteName}`,
    url: getAbsoluteUrl(item, origin)
  };
};

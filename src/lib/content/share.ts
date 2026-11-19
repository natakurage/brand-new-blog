import type { BlogData } from "./types";
import { absoluteUrlOf } from "./href";

interface ShareInfo {
  text: string;
  url: string;
}

export const getShareInfo = (item: BlogData, siteName: string, origin: string): ShareInfo => {
  return {
    text: `${item.title} - ${siteName}`,
    url: absoluteUrlOf(item, origin)
  };
};

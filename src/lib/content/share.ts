import type { CollectionSummary, ItemSummary } from "./types";
import { absoluteUrlOf } from "./href";

interface ShareInfo {
  text: string;
  url: string;
}

export const getShareInfo = (item: ItemSummary | CollectionSummary, siteName: string, origin: string): ShareInfo => {
  return {
    text: `${item.title} - ${siteName}`,
    url: absoluteUrlOf(item, origin)
  };
};

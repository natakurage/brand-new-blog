import type { BlogData, Tag } from "./types";

export const getPath = (item: BlogData | Tag): string => {
  const slug = item.typeUrl == "lists" ? item.id : item.slug;
  return `/${item.typeUrl}/${slug}`;
};

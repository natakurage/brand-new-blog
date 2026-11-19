import type { BlogData, Tag } from "./types";

export const getPath = (item: BlogData | Tag): string => {
  const slug = item.typeUrl == "lists" ? item.id : item.slug;
  return `/${item.typeUrl}/${slug}`;
};

export const getAbsoluteUrl = (item: BlogData | Tag, origin: string): string => {
  return new URL(getPath(item), origin).toString();
}
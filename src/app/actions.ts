"use server";

import { ItemListManagerMap, ItemListManagerMapKeys } from "@/lib/contentful";
import { fetchMetadata } from "@/lib/fetchMetadata";

export async function getMeta(url: string) {
  const meta = await fetchMetadata(url);
  return meta;
}

export interface listNavigatorItem {
  title: string;
  slug: string;
  typeUrl: string;
}

export async function listNavigatorInfo(key: string, currentSlug: string, managerType: ItemListManagerMapKeys, userSlug = false) {
  const manager = ItemListManagerMap.get(managerType)!;
  const list = userSlug ? await manager.getBySlug(key) : await manager.get(key);
  if (!list) return null;
  const { title, items } = list;
  const currentId = items.findIndex((item) => item.slug === currentSlug);
  if (currentId === -1) return null;
  const prev = items[currentId - 1] ?? null;
  const next = items[currentId + 1] ?? null;
  return {
    listTitle: title,
    prev: prev == null ? null : {
      title: prev.title,
      slug: prev.slug,
      typeUrl: prev.typeUrl
    } as listNavigatorItem,
    next: next == null ? null : {
      title: next.title,
      slug: next.slug,
      typeUrl: next.typeUrl
    } as listNavigatorItem
  };
}
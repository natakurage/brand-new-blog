"use server";

import { getList } from "@/lib/contentful";
import { fetchMetadata } from "@/lib/fetchMetadata";

export async function getMeta(url: string) {
  const meta = await fetchMetadata(url);
  return meta;
}

export async function getListTitleAndPosts(listId: string) {
  const { title, posts } = await getList(listId) ?? {}; 
  return { title, posts };
}
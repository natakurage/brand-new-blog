"use server";

import { fetchMetadata } from "@/lib/fetchMetadata";

export async function getMeta(url: string) {
  const meta = await fetchMetadata(url);
  return meta;
}
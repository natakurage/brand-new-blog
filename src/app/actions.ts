"use server";

import metaFetcher from "meta-fetcher";

export async function getMeta(url: string) {
  const meta = await metaFetcher(url);
  return meta;
}
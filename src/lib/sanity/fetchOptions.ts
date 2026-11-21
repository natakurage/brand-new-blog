import type { SanityClient } from "next-sanity";
import type { ReadContext } from "@/lib/content/repository";

export type ClientFor = (ctx: ReadContext) => SanityClient;

export const sliceOf = ({ page, size }: { page: number; size: number }) => ({
  start: (page - 1) * size,
  end: page * size,
});

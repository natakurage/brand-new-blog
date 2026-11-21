import type { Repositories } from "@/lib/content/repository";
import { createSanityRepositories } from "@/lib/sanity/repositories";
import { getClient } from "@/lib/sanity/client";

// どの CMS から読むかを決める唯一の場所
export const source: Repositories = createSanityRepositories((ctx) => getClient(ctx.preview));

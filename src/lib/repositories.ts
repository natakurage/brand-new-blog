import type { Repositories } from "@/lib/content/repository";
import { createSanityRepositories } from "@/lib/sanity/repositories";
import { getClient } from "@/lib/sanity/client";

export const repositories: Repositories = createSanityRepositories((ctx) => getClient(ctx.preview));

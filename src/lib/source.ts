import type { Repositories } from "@/lib/content/repository";
import type { Change } from "@/lib/content/cacheTags";
import { createSanityRepositories } from "@/lib/sanity/repositories";
import { getClient } from "@/lib/sanity/client";
import { parseSanityWebhook } from "@/lib/sanity/webhook";

// どの CMS を使うかを決める唯一の場所

export const source: Repositories = createSanityRepositories((ctx) => getClient(ctx.preview));

// CMS からの変更通知の本文を Change に翻訳する。対象外や不正な本文なら null
export const parseChangeNotification: (body: unknown) => Change | null = parseSanityWebhook;

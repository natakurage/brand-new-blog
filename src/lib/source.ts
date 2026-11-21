import type { NextRequest } from "next/server";
import type { Repositories } from "@/lib/content/repository";
import type { ChangeNotification } from "@/lib/content/change";
import { createSanityRepositories } from "@/lib/sanity/repositories";
import { getClient } from "@/lib/sanity/client";
import { parseSanityWebhook } from "@/lib/sanity/webhook";

// どの CMS を使うかを決める唯一の場所

export const source: Repositories = createSanityRepositories((ctx) => getClient(ctx.preview));

// CMS からの変更通知を、送り主を確かめたうえで Change に翻訳する
export const parseChangeNotification: (req: NextRequest) => Promise<ChangeNotification> = parseSanityWebhook;

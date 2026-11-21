import "server-only";
import type { ComponentType } from "react";
import type { NextRequest } from "next/server";
import type { Repositories } from "@/lib/content/repository";
import type { ChangeNotification } from "@/lib/content/change";
import { createSanityRepositories } from "@/lib/sanity/repositories";
import { getClient } from "@/lib/sanity/client";
import { parseSanityWebhook } from "@/lib/sanity/webhook";
import { enableSanityDraftMode, SanityVisualEditing } from "@/lib/sanity/preview";

// どの CMS を使うかを決める唯一の場所

export const source: Repositories = createSanityRepositories((ctx) => getClient(ctx.preview));

// CMS からの変更通知を、送り主を確かめたうえで Change に翻訳する
export const parseChangeNotification: (req: NextRequest) => Promise<ChangeNotification> = parseSanityWebhook;

// CMS の編集画面からの要求を確かめ、下書きの表示（draft mode）を有効にする
export const enableDraftMode: (req: Request) => Promise<Response> = enableSanityDraftMode;

// 下書きの表示中に置く、CMS の編集画面と連携する部品
export const PreviewTools: ComponentType = SanityVisualEditing;

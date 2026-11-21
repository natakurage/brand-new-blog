import * as v from "valibot";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import type { Change, ChangeNotification } from "@/lib/content/change";
import type { Kind } from "@/lib/content/types";

/*
 * Sanity の webhook の設定と対になる。
 * フィルター: _type in ["blogPost", "song", "postList", "musicAlbum", "tag", "globalSettings", "linkList", "linkItem"]
 * Projection: { _type, "slugs": [before().slug.current, after().slug.current],
 *   "items": coalesce(posts, tracks, [])[]->slug.current,
 *   "membershipChanged": delta::operation() != "update" || delta::changedAny((slug, tags)) }
 * Secret: 環境変数 SANITY_WEBHOOK_SECRET と同じ値
 */

const kindOfSanityType = new Map<string, Kind>([
  ["blogPost", "article"],
  ["song", "song"],
  ["postList", "postList"],
  ["musicAlbum", "album"],
  ["tag", "tag"],
]);

const itemKindOfSanityType = new Map<string, Kind>([
  ["postList", "article"],
  ["musicAlbum", "song"],
]);

const siteSettingsTypes = new Set(["globalSettings", "linkList", "linkItem"]);

const Payload = v.object({
  _type: v.string(),
  slugs: v.optional(v.array(v.nullable(v.string())), []),
  items: v.optional(v.array(v.nullable(v.string())), []),
  // 判定できないときは広く無効にする
  membershipChanged: v.optional(v.boolean(), true),
});

const definedSlugs = (slugs: (string | null)[]): string[] => [...new Set(slugs.filter((slug): slug is string => !!slug))];

// 対象外の文書や不正な本文なら null
const toChange = (body: unknown): Change | null => {
  const result = v.safeParse(Payload, body);
  if (!result.success) {
    return null;
  }
  const { _type, slugs, items, membershipChanged } = result.output;
  if (siteSettingsTypes.has(_type)) {
    return { target: "siteSettings" };
  }
  const kind = kindOfSanityType.get(_type);
  if (!kind) {
    return null;
  }
  const itemKind = itemKindOfSanityType.get(_type);
  return {
    target: "content",
    kind,
    slugs: definedSlugs(slugs),
    membershipChanged,
    items: itemKind ? definedSlugs(items).map((slug) => ({ kind: itemKind, slug })) : [],
  };
};

export const parseSanityWebhook = async (req: NextRequest): Promise<ChangeNotification> => {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return { status: "unauthorized" };
  }
  // useCdn を使わず、無効化も次のアクセスで作り直す方式なので、反映待ちはしない
  const { isValidSignature, body } = await parseBody(req, secret, false);
  if (!isValidSignature) {
    return { status: "unauthorized" };
  }
  const change = toChange(body);
  return change ? { status: "accepted", change } : { status: "unsupported" };
};

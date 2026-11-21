import * as v from "valibot";
import type { Change } from "@/lib/content/cacheTags";
import type { Kind } from "@/lib/content/types";

/*
 * Sanity の webhook の設定と対になる。
 * フィルター: _type in ["blogPost", "song", "postList", "musicAlbum", "tag", "globalSettings", "linkList", "linkItem"]
 * Projection: { _type, "slugs": [before().slug.current, after().slug.current],
 *   "membershipChanged": delta::operation() != "update" || delta::changedAny((slug, tags)) }
 */

const kindOfSanityType = new Map<string, Kind>([
  ["blogPost", "article"],
  ["song", "song"],
  ["postList", "postList"],
  ["musicAlbum", "album"],
  ["tag", "tag"],
]);

const siteSettingsTypes = new Set(["globalSettings", "linkList", "linkItem"]);

const Payload = v.object({
  _type: v.string(),
  slugs: v.optional(v.array(v.nullable(v.string())), []),
  // 判定できないときは広く無効にする
  membershipChanged: v.optional(v.boolean(), true),
});

// 対象外の文書や不正な本文なら null
export const parseSanityWebhook = (body: unknown): Change | null => {
  const result = v.safeParse(Payload, body);
  if (!result.success) {
    return null;
  }
  const { _type, slugs, membershipChanged } = result.output;
  if (siteSettingsTypes.has(_type)) {
    return { target: "siteSettings" };
  }
  const kind = kindOfSanityType.get(_type);
  if (!kind) {
    return null;
  }
  return {
    target: "content",
    kind,
    slugs: [...new Set(slugs.filter((slug): slug is string => !!slug))],
    membershipChanged,
  };
};

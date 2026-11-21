import { describe, expect, test } from "vitest";
import { toChange } from "./webhook";

describe("toChange", () => {
  test("Sanity の型名を種類に直し、変更前後の slug を重複と null を除いて並べる", () => {
    expect(toChange({ _type: "blogPost", slugs: ["old", "new"], membershipChanged: true })).toEqual({
      target: "content", kind: "article", slugs: ["old", "new"], membershipChanged: true, items: [],
    });
    expect(toChange({ _type: "blogPost", slugs: [null, "a"], membershipChanged: true })).toMatchObject({ slugs: ["a"] });
    expect(toChange({ _type: "blogPost", slugs: ["a", "a"], membershipChanged: false })).toMatchObject({ slugs: ["a"] });
  });

  test("リスト・アルバムの items は、項目の種類の識別子にする", () => {
    expect(toChange({ _type: "postList", slugs: ["l", "l"], items: ["a", null, "a"], membershipChanged: false }))
      .toMatchObject({ kind: "postList", items: [{ kind: "article", slug: "a" }] });
    expect(toChange({ _type: "musicAlbum", slugs: ["al"], items: ["s"] }))
      .toMatchObject({ kind: "album", items: [{ kind: "song", slug: "s" }] });
  });

  test("リスト・アルバム以外の items は無視する", () => {
    expect(toChange({ _type: "song", slugs: ["s"], items: ["x"] })).toMatchObject({ items: [] });
  });

  test("所属が変わったか判定できないときは、変わったものとして扱う", () => {
    expect(toChange({ _type: "tag", slugs: ["t"] })).toMatchObject({ membershipChanged: true });
  });

  test("サイト設定に関わる型は、まとめてサイト設定の変更にする", () => {
    expect(toChange({ _type: "linkItem" })).toEqual({ target: "siteSettings" });
  });

  test("対象外の型や不正な本文は null", () => {
    expect(toChange({ _type: "unknown", slugs: ["x"] })).toBeNull();
    expect(toChange({ slugs: ["x"] })).toBeNull();
    expect(toChange("not an object")).toBeNull();
  });
});

import { describe, expect, test } from "vitest";
import { documentsIn, tagsFor, tagsToInvalidate } from "./cacheTags";
import { article, postList } from "./fixtures";
import type { Tag } from "./types";

const tag: Tag = { kind: "tag", slug: "t", name: "タグ" };

describe("documentsIn", () => {
  test("リストは自身・タグ・項目とその項目のタグを含む", () => {
    const list = { ...postList("l", [{ ...article("a"), tags: [tag] }]), tags: [tag] };
    expect(documentsIn(list).map(({ kind, slug }) => `${kind}:${slug}`))
      .toEqual(["postList:l", "tag:t", "article:a", "tag:t"]);
  });
});

describe("tagsFor", () => {
  const documents = [{ kind: "article", slug: "a" }, { kind: "article", slug: "b" }, { kind: "tag", slug: "t" }] as const;

  test("上限までは文書ごとのタグを付ける", () => {
    expect(tagsFor(["article"], [...documents], 4)).toEqual(["article", "article:a", "article:b", "tag:t"]);
  });

  test("上限を超えると種類ごとのタグに置き換える", () => {
    expect(new Set(tagsFor(["article"], [...documents], 3))).toEqual(new Set(["article", "tag"]));
  });
});

describe("tagsToInvalidate", () => {
  test("内容だけの変更では種類のタグを無効にしない", () => {
    expect(tagsToInvalidate({ target: "content", kind: "article", slugs: ["a"], membershipChanged: false, items: [] }))
      .toEqual(["article:a"]);
  });

  test("所属が変わりうる変更では種類のタグも無効にする", () => {
    expect(tagsToInvalidate({ target: "content", kind: "article", slugs: ["old", "new"], membershipChanged: true, items: [] }))
      .toEqual(["article", "tagged", "article:old", "article:new"]);
  });

  test("リストの変更では、今含まれる項目の逆引きのタグも無効にする", () => {
    expect(tagsToInvalidate({
      target: "content", kind: "postList", slugs: ["l"], membershipChanged: false, items: [{ kind: "article", slug: "a" }],
    })).toEqual(["postList:l", "containing:article:a"]);
  });

  test("サイト設定の変更", () => {
    expect(tagsToInvalidate({ target: "siteSettings" })).toEqual(["siteSettings"]);
  });
});

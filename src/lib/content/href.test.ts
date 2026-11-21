import { describe, expect, test } from "vitest";
import { absoluteUrlOf, hrefIn, hrefOf, pageHref } from "./href";

describe("hrefOf", () => {
  test("種類ごとの区切りの下に slug を置く", () => {
    expect(hrefOf({ kind: "article", slug: "a" })).toBe("/articles/a");
    expect(hrefOf({ kind: "postList", slug: "l" })).toBe("/lists/l");
  });
});

describe("absoluteUrlOf", () => {
  test("origin の末尾のスラッシュの有無によらない", () => {
    expect(absoluteUrlOf({ kind: "song", slug: "s" }, "https://example.com/")).toBe("https://example.com/songs/s");
    expect(absoluteUrlOf({ kind: "song", slug: "s" }, "https://example.com")).toBe("https://example.com/songs/s");
  });
});

describe("pageHref", () => {
  test("1ページ目は一覧そのものの URL", () => {
    expect(pageHref("/articles", 1)).toBe("/articles");
    expect(pageHref("/articles", 2)).toBe("/articles/page/2");
  });
});

describe("hrefIn", () => {
  test("リストの slug をクエリとしてエンコードする", () => {
    expect(hrefIn({ kind: "article", slug: "a" }, { kind: "postList", slug: "日本 語&x" }))
      .toBe("/articles/a?list=%E6%97%A5%E6%9C%AC+%E8%AA%9E%26x");
  });
});

import { describe, expect, test } from "vitest";
import { absoluteUrlOf, hrefIn, hrefOf, pageHref, searchHref } from "./href";

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

describe("searchHref", () => {
  test("検索語をクエリとしてエンコードし、1ページ目は page を付けない", () => {
    expect(searchHref("C# & C++", 1)).toBe("/search?q=C%23+%26+C%2B%2B");
    expect(searchHref("a", 2)).toBe("/search?q=a&page=2");
  });
});

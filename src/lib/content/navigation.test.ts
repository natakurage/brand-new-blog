import { describe, expect, test } from "vitest";
import { navigationIn, navigationsFor } from "./navigation";
import { album, article, postList, song } from "./fixtures";
import type { PostList } from "./types";

const list = postList("l", [article("a"), article("b"), article("c")]);

describe("navigationIn", () => {
  test("前後の項目へのリンクは、同じリストの中で見ていることをクエリで示す", () => {
    expect(navigationIn(list, "b")).toEqual({
      slug: "l",
      title: "リスト l",
      href: "/lists/l",
      prev: { title: "記事 a", href: "/articles/a?list=l" },
      next: { title: "記事 c", href: "/articles/c?list=l" },
    });
  });

  test("先頭には前が、末尾には次がない", () => {
    expect(navigationIn(list, "a")).toMatchObject({ prev: null, next: { title: "記事 b" } });
    expect(navigationIn(list, "c")).toMatchObject({ prev: { title: "記事 b" }, next: null });
  });

  test("同じ項目が2回入っているときは最初の位置として扱う", () => {
    const repeated = postList("r", [article("a"), article("b"), article("c"), article("b"), article("d")]);
    expect(navigationIn(repeated, "b")).toMatchObject({ prev: { title: "記事 a" }, next: { title: "記事 c" } });
  });

  test("含まれない項目には null", () => {
    expect(navigationIn(list, "x")).toBeNull();
  });

  test("アルバムでも同じ", () => {
    expect(navigationIn(album("al", [song("s1"), song("s2")]), "s2")).toMatchObject({
      href: "/albums/al",
      prev: { href: "/songs/s1?list=al" },
      next: null,
    });
  });
});

describe("navigationsFor", () => {
  test("見つからないリストや、もう項目を含まないリストは除く", async () => {
    const lists = new Map<string, PostList>([["l", list], ["other", postList("other", [article("z")])]]);
    const navigations = await navigationsFor("b", {
      containing: async () => [{ slug: "l" }, { slug: "deleted" }, { slug: "other" }],
      findBySlug: async (slug) => lists.get(slug) ?? null,
    });
    expect(navigations.map(({ slug }) => slug)).toEqual(["l"]);
  });
});

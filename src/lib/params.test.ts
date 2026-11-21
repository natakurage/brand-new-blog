import { describe, expect, test, vi } from "vitest";
import { PageParams, parseParams, parseSearchParams, SlugPageParams } from "./params";
import * as v from "valibot";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("notFound");
  },
}));

describe("parseParams", () => {
  test("ページ番号は正の整数の表記だけを数にする", () => {
    expect(parseParams(PageParams, { page: "1" })).toEqual({ page: 1 });
    expect(parseParams(PageParams, { page: "12" })).toEqual({ page: 12 });
    for (const page of ["0", "01", "-1", "1.5", "1e2", " 1", "a", ""]) {
      expect(() => parseParams(PageParams, { page }), page).toThrow("notFound");
    }
  });

  test("空の slug は notFound", () => {
    expect(parseParams(SlugPageParams, { slug: "a", page: "2" })).toEqual({ slug: "a", page: 2 });
    expect(() => parseParams(SlugPageParams, { slug: "", page: "1" })).toThrow("notFound");
  });
});

describe("parseSearchParams", () => {
  test("スキーマにないクエリは無視する", () => {
    const Query = v.object({ q: v.optional(v.string()) });
    const query = { q: "x", utm_source: "y" };
    expect(parseSearchParams(Query, query)).toEqual({ q: "x" });
  });
});

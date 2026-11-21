import { describe, expect, test } from "vitest";
import { hasPage, pageCount, pageOf } from "./pagination";

describe("pageCount", () => {
  test("空でも1ページ、端数は1ページに数える", () => {
    expect(pageCount(0, 10)).toBe(1);
    expect(pageCount(10, 10)).toBe(1);
    expect(pageCount(11, 10)).toBe(2);
  });
});

describe("hasPage", () => {
  test("1からページ数までの番号だけが存在する", () => {
    expect(hasPage(0, { page: 1, size: 10 })).toBe(true);
    expect(hasPage(0, { page: 2, size: 10 })).toBe(false);
    expect(hasPage(11, { page: 2, size: 10 })).toBe(true);
    expect(hasPage(11, { page: 3, size: 10 })).toBe(false);
    expect(hasPage(11, { page: 0, size: 10 })).toBe(false);
  });
});

describe("pageOf", () => {
  test("そのページの分を切り出し、全体の件数を添える", () => {
    const items = [1, 2, 3, 4, 5];
    expect(pageOf(items, { page: 1, size: 2 })).toEqual({ items: [1, 2], total: 5 });
    expect(pageOf(items, { page: 3, size: 2 })).toEqual({ items: [5], total: 5 });
  });
});

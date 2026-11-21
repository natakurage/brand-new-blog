import { describe, expect, test } from "vitest";
import { hasDigest, isCollectionKind, isWork, itemKindIn } from "./types";
import { album, article, postList, song } from "./fixtures";

describe("リスト・アルバムと項目の関係", () => {
  test("リストには記事が、アルバムには曲が入る", () => {
    expect(itemKindIn).toEqual({ postList: "article", album: "song" });
    expect(isCollectionKind("postList")).toBe(true);
    expect(isCollectionKind("article")).toBe(false);
    expect(isCollectionKind("tag")).toBe(false);
  });
});

describe("型の階層による判定", () => {
  const values = [article("a"), song("s"), postList("l", []), album("al", [])];

  test("本文を持つのは記事と曲", () => {
    expect(values.map(hasDigest)).toEqual([true, true, false, false]);
  });

  test("作品として日付を持つのは記事・曲・アルバム", () => {
    expect(values.map(isWork)).toEqual([true, true, false, true]);
  });
});

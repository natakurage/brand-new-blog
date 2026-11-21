import { describe, expect, test } from "vitest";
import { describe as describeItem, digestOf } from "./summary";
import { article, postList } from "./fixtures";

describe("digestOf", () => {
  test("Markdown の記法を除いて数える", () => {
    expect(digestOf("**太字**と[リンク](https://example.com)")).toMatchObject({ excerpt: "太字とリンク", length: 6 });
  });

  test("結合文字や絵文字の連なりは1文字と数える", () => {
    expect(digestOf("が👨‍👩‍👧").length).toBe(2);
  });

  test("100文字までは切り詰めず、超えたときだけ … を付ける", () => {
    expect(digestOf("あ".repeat(100)).excerpt).toBe("あ".repeat(100));
    expect(digestOf("あ".repeat(101)).excerpt).toBe(`${"あ".repeat(100)}…`);
  });

  test("切り詰めても文字の途中で切らない", () => {
    expect(digestOf(`${"あ".repeat(99)}👨‍👩‍👧い`).excerpt).toBe(`${"あ".repeat(99)}👨‍👩‍👧…`);
  });

  test("読了時間は1分あたり500文字で切り上げる", () => {
    expect(digestOf("").readingMinutes).toBe(0);
    expect(digestOf("あ".repeat(500)).readingMinutes).toBe(1);
    expect(digestOf("あ".repeat(501)).readingMinutes).toBe(2);
  });
});

describe("describe", () => {
  test("説明文がなければ、記事・曲は抜粋を、リスト・アルバムは空文字を使う", () => {
    expect(describeItem({ ...article("a"), description: "説明", excerpt: "抜粋" })).toBe("説明");
    expect(describeItem({ ...article("a"), description: "", excerpt: "抜粋" })).toBe("抜粋");
    expect(describeItem(postList("l", []))).toBe("");
  });
});

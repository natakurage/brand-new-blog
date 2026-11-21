import { describe, expect, test } from "vitest";
import { getSongCreditText } from "./credit";
import { createCalendar } from "./date";
import { song } from "./fixtures";

const calendar = createCalendar({ locale: "ja-JP", timeZone: "Asia/Tokyo" });

describe("getSongCreditText", () => {
  test("クレジットの行は分解せず、そのまま並べる", () => {
    const text = getSongCreditText(
      { ...song("s"), artist: ["A", "B"], credit: ["作曲:C", "作曲:D", "MV:https://example.com/mv", "Special Thanks"], content: "" },
      "https://example.com",
      calendar,
    );
    expect(text).toBe([
      "- タイトル: 曲 s",
      "- アーティスト: A, B",
      "- 作曲:C",
      "- 作曲:D",
      "- MV:https://example.com/mv",
      "- Special Thanks",
      "- 作成年: 1970",
      "- URL: https://example.com/songs/s",
      "- ライセンス: 不明なライセンス",
    ].join("\n"));
  });
});

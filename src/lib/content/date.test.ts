import { expect, test } from "vitest";
import { createCalendar } from "./date";

test("年は指定したタイムゾーンで数える", () => {
  const instant = new Date("2025-12-31T15:00:00Z");
  expect(createCalendar({ locale: "ja-JP", timeZone: "Asia/Tokyo" }).year(instant)).toBe(2026);
  expect(createCalendar({ locale: "ja-JP", timeZone: "UTC" }).year(instant)).toBe(2025);
});

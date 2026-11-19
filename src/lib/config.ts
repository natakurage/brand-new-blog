import { createCalendar } from "./content/date";

if (!process.env.NEXT_PUBLIC_ORIGIN && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_ORIGIN is not set in production environment");
}
export const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN ?? "http://localhost:3000";

export const CALENDAR = createCalendar({
  locale: "ja-JP",
  timeZone: "Asia/Tokyo",
});
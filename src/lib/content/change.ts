import type { Kind } from "./types";
import type { Addressable } from "./href";

// CMS で起きた変更。slugs は変更前後の slug（slug が変わったときは両方）。
// membershipChanged は、その種類にどの文書が含まれるか・どのタグに属するかが変わりうる変更（作成・削除・slug やタグの変更）かどうか。
// items は、リスト・アルバムに今含まれている項目（それ以外の種類では空）。外された項目は、そのリストの文書タグで無効になる
export type Change =
  | { target: "content"; kind: Kind; slugs: string[]; membershipChanged: boolean; items: Addressable[] }
  | { target: "siteSettings" };

// CMS からの変更通知を読んだ結果
export type ChangeNotification =
  | { status: "accepted"; change: Change }
  | { status: "unauthorized" }
  | { status: "unsupported" };

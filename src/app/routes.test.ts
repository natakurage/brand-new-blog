import { expectTypeOf, test } from "vitest";
import type { AppRouteHandlerRoutes, AppRoutes, RewriteRoutes } from "../../.next/types/routes";
import type { IndexedKind, RawFormat, SegmentOf, rssPath, searchPath } from "@/lib/content/href";
import type { Kind } from "@/lib/content/types";

// 型だけの照合なので tsc で確かめる。ルートの型は next typegen（build・dev でも）が src/app と next.config から作る
type Routes = AppRoutes | RewriteRoutes | AppRouteHandlerRoutes;

// ルートのないキーの名前。なければ never
type WithoutRoute<T extends Record<string, string>> = { [K in keyof T]: T[K] extends Routes ? never : K }[keyof T];

test("hrefOf のパスはルートとして実在する", () => {
  expectTypeOf<WithoutRoute<{ [K in Kind]: `/${SegmentOf<K>}/[slug]` }>>().toBeNever();
});

test("一覧のパスとそのページ番号のパスはルートとして実在する", () => {
  expectTypeOf<WithoutRoute<{ [K in IndexedKind]: `/${SegmentOf<K>}` }>>().toBeNever();
  expectTypeOf<WithoutRoute<{ [K in IndexedKind]: `/${SegmentOf<K>}/page/[page]` }>>().toBeNever();
});

test("リスト・アルバム・タグのページ番号のパスはルートとして実在する", () => {
  type Paged = "postList" | "album" | "tag";
  expectTypeOf<WithoutRoute<{ [K in Paged]: `/${SegmentOf<K>}/[slug]/page/[page]` }>>().toBeNever();
});

test("rawHref のパスはルートとして実在する", () => {
  expectTypeOf<`/${SegmentOf<"article">}/[slug].${RawFormat}`>().toExtend<Routes>();
});

test("検索と RSS のパスはルートとして実在する", () => {
  expectTypeOf<typeof searchPath | typeof rssPath>().toExtend<Routes>();
});

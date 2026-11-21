import { expectTypeOf, test } from "vitest";
import type { AppRoutes, RewriteRoutes } from "../../.next/types/routes";
import type { RawFormat, SegmentOf } from "@/lib/content/href";
import type { Kind } from "@/lib/content/types";

// 型だけの照合なので tsc で確かめる。ルートの型は next typegen（build・dev でも）が src/app と next.config から作る
type Routes = AppRoutes | RewriteRoutes;

// ルートのない種類の名前。なければ never
type KindsWithoutRoute = { [K in Kind]: `/${SegmentOf<K>}/[slug]` extends Routes ? never : K }[Kind];

test("hrefOf のパスはルートとして実在する", () => {
  expectTypeOf<KindsWithoutRoute>().toBeNever();
});

test("rawHref のパスはルートとして実在する", () => {
  expectTypeOf<`/${SegmentOf<"article">}/[slug].${RawFormat}`>().toExtend<Routes>();
});

import { cacheLife } from "next/cache";
import { draftMode } from "next/headers";

// "use cache" の中で読めば、ページのプリレンダーを妨げない。draft mode のときはキャッシュが迂回され、毎回読み直される。
// キャッシュされるのは常に false なので寿命は最長にする（既定の15分だと、これを使う全ページの再検証が15分ごとになる）
export async function isPreview(): Promise<boolean> {
  "use cache";
  cacheLife("max");
  return (await draftMode()).isEnabled;
}

import { draftMode } from "next/headers";

// "use cache" の中で読めば、ページのプリレンダーを妨げない。draft mode のときはキャッシュが迂回され、毎回読み直される
export async function isPreview(): Promise<boolean> {
  "use cache";
  return (await draftMode()).isEnabled;
}

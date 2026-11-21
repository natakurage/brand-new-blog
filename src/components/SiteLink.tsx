import Link from "next/link";
import type { ComponentProps } from "react";

// サイト内のページへのリンク。ページの中身は URL で決まるので、ルート共通の枠だけでなく中身まで先読みする。
// ページは作り置きかキャッシュから作るので、先読みでサーバーはほとんど動かない。外部の URL は Next.js が先読みしない
export default function SiteLink(props: Omit<ComponentProps<typeof Link>, "prefetch">) {
  return <Link {...props} prefetch />;
}

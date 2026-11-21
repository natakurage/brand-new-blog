import type { Metadata } from "next";
import type { GlobalSettings } from "@/lib/content/types";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

// images は含めない。ページで images を指定すると opengraph-image.tsx の画像より優先されてしまうため
export const siteOpenGraph = (settings: GlobalSettings) => ({
  type: "website",
  locale: "ja_JP",
  siteName: settings.siteName,
  description: settings.description,
}) satisfies OpenGraph;

// ページの openGraph は layout のものを丸ごと置き換えるので、サイト共通の値から組み立てる。
// og:url は OGP での正規の URL なので canonical と同じにする。path は metadataBase からの相対
export const pageMetadata = (settings: GlobalSettings, path: string, openGraph?: OpenGraph) => ({
  alternates: { canonical: path },
  openGraph: { ...siteOpenGraph(settings), url: path, ...openGraph },
}) satisfies Metadata;

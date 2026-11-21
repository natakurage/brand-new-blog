import type { Metadata } from "next";
import type { GlobalSettings } from "@/lib/content/types";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

// images は含めない。ページで images を指定すると opengraph-image.tsx の画像より優先されてしまうため
export const siteOpenGraph = (settings: GlobalSettings): OpenGraph => ({
  siteName: settings.siteName,
  description: settings.description,
});

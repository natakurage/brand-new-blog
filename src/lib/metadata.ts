import type { Metadata } from "next";
import type { GlobalSettings } from "@/lib/content/types";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

export const siteOpenGraph = (settings: GlobalSettings): OpenGraph => ({
  siteName: settings.siteName,
  description: settings.description,
  images: [
    {
      url: "/banner.png",
      width: 1200,
      height: 630,
      alt: settings.siteName + " OGP"
    }
  ]
});

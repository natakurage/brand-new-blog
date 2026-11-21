import { repositories } from "@/lib/repositories";
import { ogImageSize, renderOgImage } from "@/lib/ogImage";

// 個別の画像を持たないページの既定
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image() {
  const data = await repositories.siteSettings.get();
  return renderOgImage({ title: data.siteName });
}

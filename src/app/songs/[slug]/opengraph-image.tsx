import { notFound } from "next/navigation";
import { parseParams, SlugParams } from "@/lib/params";
import { repositories } from "@/lib/repositories";
import { ogImageSize, renderOgImage } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await repositories.songs.allSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = parseParams(SlugParams, await props.params);
  const item = await repositories.songs.findBySlug(slug);
  if (!item) {
    notFound();
  }
  return renderOgImage({ title: item.title });
}

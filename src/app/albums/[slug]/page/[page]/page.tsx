import { cache } from "react";
import { parseParams, SlugPageParams } from "@/lib/params";
import { Album } from "@/lib/content/types";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";
import ItemList from "@/components/ItemList";
import StructuredData from "@/components/StructuredData";
import type { MusicAlbum, WithContext } from "schema-dts";
import { licenseUrl } from "@/lib/content/license";
import { ORIGIN } from "@/lib/config";
import { absoluteUrlOf, hrefOf, ogImageHref, pageHref } from "@/lib/content/href";
import { hasPage, pageOf } from "@/lib/content/pagination";
import { pageMetadata } from "@/lib/metadata";
import { digestOf } from "@/lib/content/summary";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";
// params を Suspense の外で読むので、移動では枠を先に出さず完成を待つ（fallback を置いていないため、空の枠より前のページのまま待つほうがよい）
export const instant = false;

const getAlbum = cache((slug: string) => (
  repositories.albums.findBySlug(slug)
));

export async function generateMetadata(props: PageProps<"/albums/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug } = params;
  const album = await getAlbum(slug);
  if (!album) { 
    notFound();
  }
  const title = `アルバム “${album.title}” - ${data.siteName}` + (params.page === 1 ? "" : `: Page ${params.page}`);
  const description = album.description ? digestOf(album.description).excerpt : data.description;
  return {
    title,
    description,
    ...pageMetadata(data, pageHref(hrefOf(album), params.page), {
      type: "music.album",
      description,
      // OGP の music:musician はプロフィールの URL で、アーティストの URL は持っていないので省く
      songs: album.items.map((song, index) => ({ url: absoluteUrlOf(song, ORIGIN), track: index + 1 })),
      releaseDate: album.releaseDate,
    }),
  };
}

export async function generateStaticParams() {
  const slugs = await repositories.albums.allSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

function JsonLD({ album }: { album: Album }) {
  const jsonLd: WithContext<MusicAlbum> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    url: absoluteUrlOf(album, ORIGIN),
    image: new URL(ogImageHref(album), ORIGIN).href,
    byArtist: album.artist.map((artist) => ({
      "@type": "MusicGroup",
      name: artist
    })),
    description: album.description,
    datePublished: album.releaseDate,
    numTracks: album.items.length,
    track: album.items.map((song) => ({
      "@type": "MusicRecording",
      name: song.title,
      url: absoluteUrlOf(song, ORIGIN),
    })),
    license: licenseUrl(album.license),
  };

  return (
    <StructuredData data={jsonLd} />
  );
}

export default async function AlbumPage(props: PageProps<"/albums/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug, page } = params;
  const pageNum = page;
  const album = await getAlbum(slug);
  if (!album) { 
    notFound();
  }
  const request = { page: pageNum, size: data.itemsPerPage };
  const { items: songs, total } = pageOf(album.items, request);
  if (!hasPage(total, request)) {
    notFound();
  }
  return (
    <>
      <JsonLD album={album} />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">アルバム &ldquo;{album.title}&rdquo;</h1>
        <div>{album.artist.join(", ")}</div>
        <p className="text-sm">{album.description}</p>
        <ItemList
          hrefFor={(n) => pageHref(hrefOf(album), n)}
          items={songs}
          total={total}
          page={pageNum}
          limit={data.itemsPerPage}
          context={album}
          showDate={false}
        />
      </div>
    </>
  );
}
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

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";

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
  const title = `アルバム ${data.siteName}` + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
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
  const songs = album.items;
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
          total={songs.length}
          page={pageNum}
          limit={data.itemsPerPage}
          context={album}
          showDate={false}
        />
      </div>
    </>
  );
}
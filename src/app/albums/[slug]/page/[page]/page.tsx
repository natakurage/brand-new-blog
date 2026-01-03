import { cache } from "react";
import { Album } from "@/lib/models";
import { loadGlobalSettings } from "@/lib/cms";
import { AlbumManager } from "@/lib/cms";
import { notFound } from "next/navigation";
import ItemList from "@/components/ItemList";
import Script from "next/script";
import type { MusicAlbum, WithContext } from "schema-dts";
import { ccDeedUrls } from "@/lib/licenses";

const getAlbum = cache((slug: string) => (
  new AlbumManager().getBySlug(slug, false)
));

export async function generateMetadata(props: { params: Promise<{ slug: string, page: string }> }) {
  const params = await props.params;
  const data = await loadGlobalSettings();
  const { slug } = params;
  const album = await getAlbum(slug);
  if (!album) { 
    notFound();
  }
  const title = `アルバム ${data.siteName}` + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export async function generateStaticParams() {
  const slugs = await new AlbumManager().getAllSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

function JsonLD({ album }: { album: Album }) {
  const ogpImageUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
  ogpImageUrl.searchParams.set("title", album.title);

  const jsonLd: WithContext<MusicAlbum> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    url: new URL(`/albums/${album.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href,
    image: ogpImageUrl.href,
    byArtist: album.artist?.map((artist) => ({
      "@type": "MusicGroup",
      name: artist
    })),
    description: album.description,
    datePublished: album.releaseDate,
    numTracks: album.items.length,
    track: album.items.map((song) => ({
      "@type": "MusicRecording",
      name: song.title,
      url: new URL(`/songs/${song.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href
    })),
    license: album.licenseSelect ? ccDeedUrls[album.licenseSelect] : album.license,
  };

  return (
    <Script
      id="json-ld"
      strategy="afterInteractive"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function AlbumPage(props: { params: Promise<{ slug: string, page: string }> }) {
  const params = await props.params;
  const { slug, page } = params;
  const pageNum = Number(page);
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
        <div>{album.artist?.join(", ")}</div>
        <p className="text-sm">{album.description}</p>
        <ItemList
          basePath={"/songs"}
          items={songs}
          total={songs.length}
          page={pageNum}
          limit={10}
          suffix={`?key=${album.slug}`}
          showDate={false}
        />
      </div>
    </>
  );
}
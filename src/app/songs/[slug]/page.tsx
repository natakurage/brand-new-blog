import { cache } from "react";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdMusicNote } from "react-icons/md";
import Link from "next/link";
import Script from "next/script";
import { getShareInfo, Song } from "@/lib/models";
import { loadGlobalSettings } from "@/lib/cms";
import { SongManager } from "@/lib/cms";
import { draftMode } from "next/headers";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import React, { Suspense } from "react";
import ListNavigator from "@/components/ListNavigator";
import { FaExternalLinkAlt } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";
import { getYouTubeId, isYouTube } from "@/components/LinkProcessor";
import ArticleBody from "@/components/ArticleBody";
import HLSAudioPlayer from "@/components/HLSAudioPlayer";
import removeMd from "remove-markdown";
import HeaderTime from "@/components/HeaderTime";
import HeaderTags from "@/components/HeaderTags";
import Credit from "@/components/Credit";
import type { MusicRecording, WithContext } from "schema-dts";
import { ccDeedUrls } from "@/lib/licenses";

const getSong = cache((slug: string, isEnabled: boolean) => (
  new SongManager().getBySlug(slug, isEnabled)
));

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const data = await loadGlobalSettings();
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await getSong(slug, isEnabled);
  if (!song) {
    notFound();
  }
  const title = song.title + " - " + data.siteName;
  const ogpImageUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
  ogpImageUrl.searchParams.set("title", title);
  return {
    title: (isEnabled ? "(プレビュー)" : "") + title,
    openGraph: {
      title: title,
      description: removeMd(song.content).slice(0, 100) || data.description,
      url: new URL(`/songs/${song.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href,
      images: [
        {
          url: ogpImageUrl.href,
          width: 1200,
          height: 630,
          alt: song.title + " OGP"
        }
      ]
    }
  };
}

export async function generateStaticParams() {
  const slugs = await new SongManager().getAllSlugs();
  return slugs.map((slug) => ({ slug, key: undefined }));
}

function JsonLD({ song }: { song: Song }) {
  const ogpImageUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
  ogpImageUrl.searchParams.set("title", song.title);
  const jsonLd: WithContext<MusicRecording> = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    description: removeMd(song.content).slice(0, 100),
    url: new URL(`/songs/${song.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href,
    datePublished: song.releaseDate,
    byArtist: song.artist.map((artist) => ({
      "@type": "MusicGroup",
      name: artist
    })),
    license: song.licenseSelect ? ccDeedUrls[song.licenseSelect] : song.license,
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

export default async function SongPage(
  { params } : { params: { slug: string } }
) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await getSong(slug, isEnabled);
  if (!song) {
    notFound();
  }

  const modifiedLyrics = song.lyrics?.replaceAll(/(?<!\n)\n(?!\n)/g, '  \n');

  const shareInfo = await getShareInfo(song);

  const licenseInfo = new Map<string, string>([
    ["タイトル", song.title],
    ["アーティスト", song.artist.join(", ")]
  ]);
  song.credit?.forEach((credit) => {
    const [k, v] = credit.split(":");
    licenseInfo.set(k, v);
  });
  ([
    ["作成年", new Date(song.createdAt).getFullYear().toString()],
    ["URL", shareInfo.url],
    ["ライセンス", song.licenseSelect ?? song.license ?? "不明なライセンス"],
  ]).forEach(([k, v]) => licenseInfo.set(k, v));
  const licenseText = Array.from(licenseInfo.entries()).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  const shareFullText = `# ${song.title}\n\n ${song.content}\n\n## Lyrics\n\n${modifiedLyrics}\n\n---\n\n${licenseText}`;

  return (
    <>
      <JsonLD song={song} />
      <main>
        <header className="space-y-5">
          <h1 className="text-4xl font-bold">{song.title}</h1>
          <div>by {song.artist.join(", ")}</div>
          <HeaderTags tags={song.tags || []} />
          <div className="text-sm flex flex-wrap">
            <HeaderTime createdAt={song.createdAt} className="ms-auto" />
          </div>
        </header>
        <article className="my-16 space-y-4">
          {
            song.url && <div>
              {
                // youtubeリンクがあれば埋め込む
                song.url.find((url) => isYouTube(url)) &&
                <YouTubePlayer vid={getYouTubeId(song.url.find((url) => isYouTube(url))!) || ""} />
              }
              <ul>
                {
                  song.url.map((url) => (
                    <li key={url} className="text-sm text-primary flex flex-row">
                      <FaExternalLinkAlt />
                      <Link href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
          }
          {
            song.streamUrl && <div className="space-y-2">
              <h2 className="text-2xl font-bold"><MdMusicNote className="my-auto inline" />ここで全部聴く</h2>
              <HLSAudioPlayer url={song.streamUrl} />
            </div>
          }
          <ArticleBody content={song.content} />
          {
            song.credit && <ul className="text-right">
              {
                song.credit.map((credit, index) => (
                  <li key={index}>{credit}</li>
                ))
              }
            </ul>
          }
          <h2 className="text-2xl font-bold">Lyrics</h2>
          {
            song.lyrics && <Markdown className="prose dark:!prose-invert break-words">
              {modifiedLyrics}
            </Markdown>
          }
        </article>
        <footer className="space-y-5">
          <Suspense fallback={<div>Loading...</div>}>
            <ListNavigator slug={slug} managerType="Album" useSlug />
          </Suspense>
          <ShareButtons shareText={shareInfo.text} shareUrl={shareInfo.url} fullText={shareFullText} />
          <Credit
            workType="曲"
            title={song.title}
            artists={song.artist}
            url={shareInfo.url}
            year={new Date(song.createdAt).getFullYear()}
            additionalInfo={song.credit}
            licenseSelect={song.licenseSelect}
            license={song.license}
          />
        </footer>
      </main>
    </>
  );
}
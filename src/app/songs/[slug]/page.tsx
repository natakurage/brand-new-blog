import { cache } from "react";
import { parseParams, SlugParams } from "@/lib/params";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdMusicNote, MdDownload } from "react-icons/md";
import Link from "next/link";
import Script from "next/script";
import { Song } from "@/lib/content/types";
import { getShareInfo } from "@/lib/content/share";
import { getSongCreditText } from "@/lib/content/credit";
import { repositories } from "@/lib/repositories";
import { draftMode } from "next/headers";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { Suspense } from "react";
import ListNavigator from "@/components/ListNavigator";
import { FaExternalLinkAlt, FaFileSignature } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";
import { getYouTubeId, isYouTube } from "@/components/LinkProcessor";
import ArticleBody from "@/components/ArticleBody";
import HLSAudioPlayer from "@/components/HLSAudioPlayer";
import HeaderTime from "@/components/HeaderTime";
import TagList from "@/components/TagList";
import Credit from "@/components/Credit";
import type { MusicRecording, WithContext } from "schema-dts";
import { licenseUrl } from "@/lib/content/license";
import { CALENDAR, ORIGIN } from "@/lib/config";
import { siteOpenGraph } from "@/lib/metadata";
import { absoluteUrlOf } from "@/lib/content/href";
import { describe } from "@/lib/content/summary";

const getSong = cache((slug: string, isEnabled: boolean) => (
  repositories.songs.findBySlug(slug, { preview: isEnabled })
));

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = parseParams(SlugParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { isEnabled } = await draftMode();
  const { slug } = params;
  const song = await getSong(slug, isEnabled);
  if (!song) {
    notFound();
  }
  const title = song.title + " - " + data.siteName;
  const description = describe(song) || data.description;
  const ogpImageUrl = new URL(`/og`, ORIGIN);
  ogpImageUrl.searchParams.set("title", title);
  return {
    title: (isEnabled ? "(プレビュー)" : "") + title,
    description: description,
    openGraph: {
      ...siteOpenGraph(data),
      title: title,
      description: description,
      url: absoluteUrlOf(song, ORIGIN),
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

function separate_urls(urls: string[]) {
  const youtube_url = urls.find((url) => isYouTube(url));
  const mp3_url = urls.find((url) => url.endsWith(".mp3"));
  const flac_url = urls.find((url) => url.endsWith(".flac"));
  const mp3_sig_url = urls.find((url) => url.endsWith(".mp3.sig"));
  const flac_sig_url = urls.find((url) => url.endsWith(".flac.sig"));

  const other_urls = urls.filter((url) => ![
    youtube_url, mp3_url, flac_url, mp3_sig_url, flac_sig_url
  ].includes(url));

  return { youtube_url, mp3_url, flac_url, mp3_sig_url, flac_sig_url, other_urls };
}

function DownloadLinkTable({ urls }: { urls: string[] }) {
  const { mp3_url, flac_url, mp3_sig_url, flac_sig_url } = separate_urls(urls);

  const formats = [
    {
      "name": "MP3 (192kbps, 44100 Hz)",
      "url": mp3_url,
      "sig_url": mp3_sig_url
    },
    {
      "name": "FLAC (24 bit, 44100 Hz)",
      "url": flac_url,
      "sig_url": flac_sig_url
    }
  ].filter(format => format.url);

  return (
    <table className="table w-full text-center bg-base-100 text-base-content rounded-box border border-base-300">
      <thead>
        <tr>
          <th>Format</th>
          <th><MdDownload className="inline align-middle" />Download</th>
          <th><FaFileSignature className="inline align-middle" />Signature</th>
        </tr>
      </thead>
      <tbody>
      {
        formats.map(format => (
          <tr key={format.name}>
            <td className="text-lg font-bold">
              {format.name}
            </td>
            <td className="p-0">
              <a href={format.url} target="_blank" rel="noopener noreferrer" className="btn btn-accent w-full">
                <MdDownload size={32} />
              </a>
            </td>
            <td>
            {
              format.sig_url ? <>[<a href={format.sig_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary">
                Signature
              </a>]</> : "Missing"
            }
            </td>
          </tr>
        ))
      }
      </tbody>
    </table>
  );
}

export async function generateStaticParams() {
  const slugs = await repositories.songs.allSlugs();
  return slugs.map((slug) => ({ slug, key: undefined }));
}

function JsonLD({ song }: { song: Song }) {
  const ogpImageUrl = new URL(`/og`, ORIGIN);
  ogpImageUrl.searchParams.set("title", song.title);
  const jsonLd: WithContext<MusicRecording> = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    description: describe(song),
    url: absoluteUrlOf(song, ORIGIN),
    datePublished: song.releaseDate,
    byArtist: song.artist.map((artist) => ({
      "@type": "MusicGroup",
      name: artist
    })),
    license: licenseUrl(song.license),
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

export default async function SongPage(props: { params: Promise<{ slug: string }> }) {
  const params = parseParams(SlugParams, await props.params);
  const { isEnabled } = await draftMode();
  const { slug } = params;
  const [data, song] = await Promise.all([
    repositories.siteSettings.get(),
    getSong(slug, isEnabled)
  ]);
  if (!song) {
    notFound();
  }

  const { youtube_url, mp3_url, flac_url, other_urls } = separate_urls(song.url ?? []);
  const downloadable = !!(mp3_url || flac_url);

  const modifiedLyrics = song.lyrics?.replaceAll(/(?<!\n)\n(?!\n)/g, '  \n');

  const shareInfo = getShareInfo(song, data.siteName, ORIGIN);

  const creditText = getSongCreditText(song, ORIGIN, CALENDAR);
  const shareFullText = `# ${song.title}\n\n ${song.content}\n\n## Lyrics\n\n${modifiedLyrics}\n\n---\n\n${creditText}`;

  return (
    <>
      <JsonLD song={song} />
      <main className="space-y-5">
        <article className="space-y-5">
          <header className="space-y-5">
            <h1 className="text-4xl font-bold">{song.title}</h1>
            <div>by {song.artist.join(", ")}</div>
            <TagList tags={song.tags} />
            <div className="text-sm flex flex-wrap">
              <HeaderTime createdAt={song.createdAt} length={song.length} readingMinutes={song.readingMinutes} className="ms-auto" />
            </div>
          </header>
          { youtube_url && <YouTubePlayer vid={getYouTubeId(youtube_url) || ""} /> }
          <ul>
            {
              other_urls.map((url) => (
                <li key={url} className="text-sm text-primary flex flex-row">
                  <FaExternalLinkAlt />
                  <Link href={url} target="_blank" rel="noopener noreferrer">
                    {url}
                  </Link>
                </li>
              ))
            }
          </ul>
          {
            song.streamUrl && <section className="space-y-2">
              <h2 className="text-2xl font-bold"><MdMusicNote className="my-auto inline" />ここで全部聴く</h2>
              <HLSAudioPlayer url={song.streamUrl} />
            </section>
          }
          {
            downloadable && <section className="space-y-2">
              <h2 className="text-2xl font-bold">
                <MdDownload className="inline align-middle" />
                Download
              </h2>
              <DownloadLinkTable urls={song.url ?? []} />
            </section>
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
          {
            song.lyrics && <section className="space-y-2">
              <h2 className="text-2xl font-bold">Lyrics</h2>
                <div className="prose dark:prose-invert! wrap-break-word">
                  <Markdown>
                    {modifiedLyrics}
                  </Markdown>
                </div>
            </section>
          }
          <footer className="space-y-5">
            <Suspense fallback={<div>Loading...</div>}>
              <ListNavigator slug={slug} kind="album" />
            </Suspense>
            <ShareButtons shareText={shareInfo.text} shareUrl={shareInfo.url} fullText={shareFullText} />
            <Credit
              workType="曲"
              title={song.title}
              artists={song.artist}
              url={shareInfo.url}
              year={CALENDAR.year(song.createdAt)}
              additionalInfo={song.credit}
              license={song.license}
            />
          </footer>
        </article>
      </main>
    </>
  );
}
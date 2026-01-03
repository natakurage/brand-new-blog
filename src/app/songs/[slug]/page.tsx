import { cache } from "react";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdMusicNote, MdDownload } from "react-icons/md";
import Link from "next/link";
import Script from "next/script";
import { getShareInfo, Song } from "@/lib/models";
import { loadGlobalSettings } from "@/lib/cms";
import { SongManager } from "@/lib/cms";
import { draftMode } from "next/headers";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { Suspense } from "react";
import ListNavigator from "@/components/ListNavigator";
import { FaExternalLinkAlt, FaFileSignature } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";
import { getYouTubeId, isYouTube } from "@/components/LinkProcessor";
import ArticleBody from "@/components/ArticleBody";
import HLSAudioPlayer from "@/components/HLSAudioPlayer";
import removeMd from "remove-markdown";
import HeaderTime from "@/components/HeaderTime";
import TagList from "@/components/TagList";
import Credit from "@/components/Credit";
import type { MusicRecording, WithContext } from "schema-dts";
import { ccDeedUrls } from "@/lib/licenses";

const getSong = cache((slug: string, isEnabled: boolean) => (
  new SongManager().getBySlug(slug, isEnabled)
));

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await loadGlobalSettings();
  const { isEnabled } = await draftMode();
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

export default async function SongPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { isEnabled } = await draftMode();
  const { slug } = params;
  const song = await getSong(slug, isEnabled);
  if (!song) {
    notFound();
  }

  const { youtube_url, mp3_url, flac_url, other_urls } = separate_urls(song.url ?? []);
  const downloadable = !!(mp3_url || flac_url);

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
      <main className="space-y-5">
        <article className="space-y-5">
          <header className="space-y-5">
            <h1 className="text-4xl font-bold">{song.title}</h1>
            <div>by {song.artist.join(", ")}</div>
            <TagList tags={song.tags || []} />
            <div className="text-sm flex flex-wrap">
              <HeaderTime createdAt={song.createdAt} length={removeMd(song.content).length} className="ms-auto" />
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
                <Markdown className="prose dark:!prose-invert break-words">
                  {modifiedLyrics}
                </Markdown>
            </section>
          }
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
        </article>
      </main>
    </>
  );
}
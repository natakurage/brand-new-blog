import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdMusicNote } from "react-icons/md";
import Link from "next/link";
import { SongManager } from "@/lib/contentful";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { draftMode } from "next/headers";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import React, { Suspense } from "react";
import data from "@/app/data/data.json";
import ListNavigator from "@/components/ListNavigator";
import { FaExternalLinkAlt } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";
import PreviewWarning from "@/components/PreviewWarning";
import { getYouTubeId, isYouTube } from "@/components/LinkProcessor";
import ArticleBody from "@/components/ArticleBody";
import HLSAudioPlayer from "@/components/HLSAudioPlayer";
import removeMd from "remove-markdown";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await new SongManager().getBySlug(slug, isEnabled);
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

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await new SongManager().getAllSlugs();
  return slugs.map((slug) => ({ slug, key: undefined }));
}

export default async function SongPage(
  { params } : { params: { slug: string } }
) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await new SongManager().getBySlug(slug, isEnabled);
  if (!song) {
    notFound();
  }

  const modifiedLyrics = song.lyrics?.replaceAll(/(?<!\n)\n(?!\n)/g, '  \n');

  const origin = process.env.NEXT_PUBLIC_ORIGIN;
  if (!origin) {
    throw new Error("Missing NEXT_PUBLIC_ORIGIN");
  }

  const shareText = `${song.title} - ${data.siteName}`;
  const shareUrl = `${origin}/songs/${song.slug}`;

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
    ["URL", shareUrl],
    ["ライセンス", song.license],
  ] as [string, string][]).forEach(([k, v]) => licenseInfo.set(k, v));
  const licenseText = Array.from(licenseInfo.entries()).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  const shareFullText = `# ${song.title}\n\n ${song.content}\n\n## Lyrics\n\n${modifiedLyrics}\n\n---\n\n${licenseText}`;

  return (
    <main>
      { isEnabled && <PreviewWarning /> }
      <header className="space-y-5">
        <h1 className="text-4xl font-bold">{song.title}</h1>
        <div>by {song.artist.join(", ")}</div>
        <div className="space-x-2">
        {
          song.tags?.map((tag) => (
            <Link key={tag.sys.id} href={`/tags/${tag.sys.id}`}>
              <span className="badge badge-neutral link link-hover">
                # {tag.name}
              </span>
            </Link>
          ))
        }
        </div>
        <div className="text-sm flex flex-wrap gap-2 justify-end">
          {
            song.releaseDate && <span className="flex flex-row gap-1 tooltip" data-tip="Published">
              <MdAccessTime className="my-auto" />
              <time>{new Date(song.releaseDate).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
            </span>
          }
          <span className="flex flex-row gap-1 tooltip" data-tip="Built">
            <FaScrewdriverWrench className="my-auto" />
            <time>
            {
              new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
              + " "
              + new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })
            }
            </time>
          </span>
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
        <ShareButtons shareText={shareText} shareUrl={shareUrl} fullText={shareFullText} />
        <div className="border border-base-content border-dashed rounded p-3 space-y-2">
          <h6 className="font-bold">Credit</h6>
          <ul>
            <li>タイトル: {song.title}</li>
            <li>アーティスト: {song.artist.join(", ")}</li>
            {
              song.credit && song.credit.map((credit, index) => (
                <li key={index}>{credit}</li>
              ))
            }
            {song.releaseDate && <li>作成年: {new Date(song.releaseDate).getFullYear()}</li>}
          </ul>
          <h6 className="font-bold">License</h6>
          {song.license == null
            ? <p>ライセンスが不明です。</p>
            : <Markdown className="prose dark:!prose-invert break-words">{song.license}</Markdown>
          }
        </div>
      </footer>
    </main>
  );
}
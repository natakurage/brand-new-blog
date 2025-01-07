import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdWarning } from "react-icons/md";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import { getAllSongSlugs, getSong } from "@/lib/contentful";
import remarkGfm from "remark-gfm";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { draftMode } from "next/headers";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import DisablePreview from "@/components/DisablePreview";
import React, { Suspense } from "react";
import EmbedCard from "@/components/EmbedCard";
import data from "@/app/data/data.json";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./style.css";
import ListNavigator from "@/components/ListNavigator";
import Image from "next/image";
import { FaExternalLinkAlt } from "react-icons/fa";
import ShareButtons from "@/components/ShareButtons";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await getSong(slug);
  if (!song) {
    notFound();
  }
  return {
    title: (isEnabled ? "(プレビュー)" : "") + song.title + " - " + data.siteName,
  };
}

function LinkProcessor({ href, children }: { href: string, children: React.ReactNode }) {
  let url = null;
  if (href.startsWith("/")) {
    return <EmbedCard url={href} />;
  }
  try {
    url = new URL(href);
  } catch {
    return <a href={href}>{children}</a>;
  }
  if (url.searchParams.get("embed") != null) {
    let vid = "";
    if (url.hostname === "www.youtube.com") {
      vid = url.searchParams.get("v") || "";
      return <YouTubePlayer vid={vid} />;
    }
    if (url.hostname === "youtu.be") {
      vid = url.pathname.slice(1);
      return <YouTubePlayer vid={vid} />;
    }
  }
  return href && <EmbedCard url={href} />;
}

function isYouTube(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "www.youtube.com" || u.hostname === "youtu.be";
  } catch {
    return false;
  }
}

function getYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    else {
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSongSlugs();
  return slugs.map((slug) => ({ slug, listId: undefined }));
}

export default async function ArticlePage(
  { params } : { params: { slug: string } }
) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const song = await getSong(slug);
  if (!song) {
    notFound();
  }

  const origin = process.env.NEXT_PUBLIC_ORIGIN;
  if (!origin) {
    throw new Error("Missing NEXT_PUBLIC_ORIGIN");
  }

  const shareText = `${song.title} - ${data.siteName}`;
  const shareUrl = `${origin}/songs/${song.slug}`;
  
  return (
    <main>
      {
        isEnabled &&
        <div className="my-4 space-y-2">
          <div role="alert" className="alert alert-warning">
            <MdWarning size={24} />
            <span>
              このページはプレビューです！
              もし何らかの理由でこのページが見えてしまった場合、
              悪いことを考える前に
              <Link
                href={data.contactURL}
                className="link underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                こちら
              </Link>
              までお知らせください。
            </span>
          </div>
          <DisablePreview className="btn btn-ghost btn-sm" />
        </div>
      }
      <header className="space-y-1">
        <h1 className="text-4xl font-bold">{song.title}</h1>
        <div>{song.artist.join(", ")}</div>
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
          <span className="flex flex-row gap-1 tooltip" data-tip="Published">
            <MdAccessTime className="my-auto" />
            <time>{new Date(song.releaseDate).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
          </span>
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
        <hr />
      </header>
      <article className="my-16 space-y-4">
        {
          // youtubeリンクがあれば埋め込む
          song.url.find((url) => isYouTube(url)) &&
          <YouTubePlayer vid={getYouTubeId(song.url.find((url) => isYouTube(url))!) || ""} />
        }
        <div>
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
        <Markdown
          className="prose dark:!prose-invert break-words"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeSlug, rehypeKatex]}
          components={{
            p: ({ children }) => {
              if (children == null) return null;
              // 単独の<a>を含む<p>の場合
              if (React.Children.count(children) === 1 && React.isValidElement(children) && children.type === "a") {
                const href = children.props.href;
                if (typeof href === "string") {
                  return <LinkProcessor href={href}>
                    {children.props.children}
                  </LinkProcessor>; 
                }
              }
              return <p>{children}</p>;
            },
            img: ({ src, alt }) => {
              if (src == null) return null;
              return (
                <span className="block relative">
                  <Image
                    src={`https:${src}`}
                    alt={alt ? alt : "Article Image"}
                    fill
                    sizes="100%"
                    className="object-contain !relative !w-auto mx-auto"
                  />
                </span>
              );
            },
          }}
        >
          {song.description}
        </Markdown>
        <ul className="text-right">
          {
            song.credit.map((credit, index) => (
              <li key={index}>{credit}</li>
            ))
          }
        </ul>
        <h2 className="text-2xl font-bold">Lyrics</h2>
        <Markdown className="prose dark:!prose-invert break-words">
          {song.lyrics.replaceAll(/(?<!\n)\n(?!\n)/g, '  \n')}
        </Markdown>
      </article>
      <footer className="space-y-3">
        <Suspense fallback={<div>Loading...</div>}>
          <ListNavigator slug={slug} />
        </Suspense>
        <ShareButtons shareText={shareText} shareUrl={shareUrl} />
        <div className="border border-base-content border-dashed rounded p-3 space-y-2">
          <h6 className="font-bold">Credit</h6>
          <ul>
            <li>タイトル: {song.title}</li>
            <li>アーティスト: {song.artist.join(", ")}</li>
            {
              song.credit.map((credit, index) => (
                <li key={index}>{credit}</li>
              ))
            }
            <li>作成年: {new Date(song.releaseDate).getFullYear()}</li>
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
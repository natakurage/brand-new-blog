import { load } from "cheerio";
import { cacheLife } from "next/cache";
import { Content } from "@/lib/content/types";
import { repositories } from "@/lib/repositories";
import { ORIGIN } from "./config";
import { describe } from "./content/summary";

export interface Metadata {
  metadata: {
      website: string;
      title: string;
      description: string | undefined;
      banner: string | undefined;
      themeColor: string | undefined;
  };
  favicons: string[];
};

// noPreview はリンク先が存在するがプレビューを作れないもの（Web ページでない、プレビュー未対応の内部ページ）。
// unavailable は一時的に取得できなかったもの
export type LinkPreview =
  | { status: "found"; metadata: Metadata }
  | { status: "notFound" }
  | { status: "noPreview" }
  | { status: "unavailable" };

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  return url.startsWith("/") ? internalPreview(url) : externalPreview(url);
}

async function internalPreview(url: string): Promise<LinkPreview> {
  const absUrl = new URL(url, ORIGIN);
  const [, type, slug] = absUrl.pathname.split("/");
  let post: Content | null;
  if (type === "articles") {
    post = await repositories.articles.findBySlug(slug);
  } else if (type === "songs") {
    post = await repositories.songs.findBySlug(slug);
  } else {
    return { status: "noPreview" };
  }
  if (!post) {
    return { status: "notFound" };
  }
  const data = await repositories.siteSettings.get();
  const bannerUrl = new URL(`/og`, ORIGIN);
  bannerUrl.searchParams.set("title", post.title);
  if ("mainImage" in post && post.mainImage) {
    bannerUrl.searchParams.set("bgImage", post.mainImage);
  }
  return {
    status: "found",
    metadata: {
      metadata: {
        website: absUrl.href,
        title: post.title,
        description: describe(post),
        banner: bannerUrl.href,
        themeColor: undefined,
      },
      favicons: [data.favicon],
    },
  };
}

// 結果によってキャッシュの寿命を変える。一時的な失敗はすぐ取り直す
async function externalPreview(url: string): Promise<LinkPreview> {
  "use cache";
  const response = await fetchPage(url);
  if (response === null || (!response.ok && response.status !== 404 && response.status !== 410)) {
    cacheLife("hours");
    return { status: "unavailable" };
  }
  if (!response.ok) {
    cacheLife("days");
    return { status: "notFound" };
  }
  cacheLife("weeks");
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return { status: "noPreview" };
  }
  const $ = load(await response.text());
  const favicons = Array.from($("link[rel='icon'],link[rel='shortcut icon'],link[rel='apple-touch-icon']"))
    .map((favicon) => resolveUrl(favicon.attribs.href, url))
    .filter((href) => href !== undefined);
  if (favicons.length === 0) {
    favicons.push(new URL("favicon.ico", new URL(url).origin).href);
  }
  return {
    status: "found",
    metadata: {
      metadata: {
        website: url,
        title: $("title").text(),
        description: $("meta[name='description']").attr("content"),
        banner: resolveUrl($("meta[property='og:image']").attr("content"), url),
        themeColor: safeColor($("meta[name='theme-color']").attr("content")),
      },
      favicons,
    },
  };
}

const fetchPage = async (url: string): Promise<Response | null> => {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(5000) });
  } catch {
    return null;
  }
};

// 外部のサイトが書いた値を style に入れるので、色の形をしたものだけを通す（";" などで別の CSS を足されないように）
const colorPattern = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\))$/i;

const safeColor = (value: string | undefined): string | undefined => {
  const color = value?.trim();
  return color && colorPattern.test(color) ? color : undefined;
};

const resolveUrl = (href: string | undefined, base: string): string | undefined => {
  if (!href) {
    return undefined;
  }
  try {
    return new URL(href, base).href;
  } catch {
    return undefined;
  }
};

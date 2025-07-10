import { load } from "cheerio";
import { BlogItem } from "@/lib/models";
import { BlogPostManager, SongManager } from "./contentful";
import removeMd from "remove-markdown";

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

export async function fetchMetadata(url: string) {
  // if internal URL
  if (url.startsWith("/")) {
    const absUrl = new URL(url, process.env.NEXT_PUBLIC_ORIGIN);
    const [, type, slug] = absUrl.pathname.split("/");
    let post: BlogItem | null = null;
    let flag = true;
    if (type === "articles") {
      post = await new BlogPostManager().getBySlug(slug, false);
    }
    else if (type === "songs") {
      post = await new SongManager().getBySlug(slug, false);
    }
    else {
      flag = false;
    }
    if (flag) {
      const metadata: Metadata = {
        metadata: {
          website: absUrl.href,
          title: "Not Found",
          description: "Page not found",
          banner: undefined,
          themeColor: undefined,
        },
        favicons: ["/favicons/favicon.ico"]
      };
      if (!post) {
        return metadata;
      }
      const bunnerImgUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
      bunnerImgUrl.searchParams.set("title", post.title);
      metadata.metadata.title = post.title;
      metadata.metadata.description = removeMd(post.content).slice(0, 100);
      metadata.metadata.banner = bunnerImgUrl.href;
      return metadata;
    }
  }

  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);
  const favicons = Array.from($("link[rel='icon'],link[rel='shortcut icon'],link[rel='apple-touch-icon']")).map((favicon) => (
    new URL(favicon.attribs.href, url).href
  ));
  if (favicons.length === 0) {
    favicons.push(new URL("favicon.ico", new URL(url).origin).href);
  }

  const metadata: Metadata = {
    metadata: {
      website: url,
      title: $("title").text(),
      description: $("meta[name='description']").attr("content"),
      banner: $("meta[property='og:image']").attr("content"),
      themeColor: $("meta[name='theme-color']").attr("content"),
    },
    favicons
  };
  return metadata;
}
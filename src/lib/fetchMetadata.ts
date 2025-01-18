import { load } from "cheerio";

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
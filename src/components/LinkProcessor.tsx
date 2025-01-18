import EmbedCard from "./EmbedCard";
import TweetEmbed from "./TweetEmbed";
import { YouTubePlayer } from "./YoutubePlayer";

export function isYouTube(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "www.youtube.com" || u.hostname === "youtu.be";
  } catch {
    return false;
  }
}

export function getYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "www.youtube.com") return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.split("/")[1];
    else {
      return null;
    }
  } catch {
    return null;
  }
}

function isTwitter(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "twitter.com" || u.hostname === "x.com";
  } catch {
    return false;
  }
}

export default function LinkProcessor({ href, children }: { href: string, children: React.ReactNode }) {
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
    if (isYouTube(url.href)) {
      const vid = getYouTubeId(url.href) || "";
      return <YouTubePlayer vid={vid} />;
    }
    if (isTwitter(url.href)) {
      return <TweetEmbed url={url.href.split("?")[0]} />;
    }
  }
  return href && <EmbedCard url={href} />;
}
import { Feed } from "feed";
import { repositories } from "@/lib/repositories";
import { ORIGIN } from "@/lib/config";
import { absoluteUrlOf } from "@/lib/content/href";
import { describe, toPlainText } from "@/lib/content/summary";

export async function GET() {
  const data = await repositories.siteSettings.get();
  const { items: posts } = await repositories.articles.list(
    { page: { page: 1, size: data.itemsPerPage } },
  );

  const feed = new Feed({
    title: data.siteName,
    description: toPlainText(data.description),
    id: ORIGIN,
    link: ORIGIN,
    language: "ja",
    generator: data.siteName,
    feedLinks: { rss: new URL("/rss", ORIGIN).href },
    // 内容が最後に変わった時刻
    updated: posts.length > 0 ? new Date(Math.max(...posts.map((post) => post.updatedAt.getTime()))) : undefined,
  });

  for (const post of posts) {
    const url = absoluteUrlOf(post, ORIGIN);
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: describe(post),
      date: post.createdAt,
    });
  }

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
  });
}

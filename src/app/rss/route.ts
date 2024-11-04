import { getPosts } from "@/lib/contentful";
import rss from "rss";
import data from "@/app/data/data.json";
import removeMd from "remove-markdown";

export async function GET(request: Request) {
  const url = new URL(request.url).origin;

  if (!url) {
    return new Response(null, { status: 404 });
  }

  const feed = new rss({
    title: data.siteName,
    description: data.description,
    site_url: url,
    feed_url: `${url}/rss.xml`,
    language: "ja",
  });

  const { posts } = await getPosts({});

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: removeMd(post.body).slice(0, 100) + "...",
      url: `${url}/articles/${post.slug}`,
      author: data.author,
      date: post.createdAt,
    });
  });  

  return new Response(feed.xml({ indent: true }));
}
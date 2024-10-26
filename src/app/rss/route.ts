import { getPosts } from "@/lib/contentful";
import rss from "rss";
import data from "@/app/data/data.json";

export async function GET() {
  const url = process.env.HOST;

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
      description: post.body.replace(/[#\[\]\(\)\n]/g, ' ').slice(0, 100) + "...",
      url: `${url}/articles/${post.slug}`,
      author: data.author,
      date: post.createdAt,
    });
  });  

  return new Response(feed.xml({ indent: true }));
}
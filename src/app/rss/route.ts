import { getPosts } from "@/lib/contentful";
import rss from "rss";

const url = "https://natakurage-blog.vercel.app";

export async function GET() {
  const feed = new rss({
    title: "ナタクラゲのブログ",
    description: "ナタクラゲのブログ",
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
      author: "千本槍みなも@ナタクラゲ",
      date: post.createdAt,
    });
  });  

  return new Response(feed.xml({ indent: true }));
}
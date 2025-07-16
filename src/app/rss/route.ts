import { loadGlobalSettings } from "@/lib/cmsUtils";
import { BlogPostManager } from "@/lib/cms";
import removeMd from "remove-markdown";

export async function GET(request: Request) {
  const data = await loadGlobalSettings();
  const url = new URL(request.url).origin;

  if (!url) {
    return new Response(null, { status: 404 });
  }

  const { items: posts } = await new BlogPostManager().getNewest({
    page: 0,
    limit: 10
  });

  const items = posts.map(post => `<item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${removeMd(post.content).slice(0, 100) + "..."}]]></description>
      <link>${url}/articles/${post.slug}</link>
      <guid isPermaLink="false">${url}/articles/${post.slug}</guid>
      <dc:creator><![CDATA[${data.author}]]></dc:creator>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
    </item>`
  );

  const channel = `<channel>
  <title>${data.siteName}</title>
  <description>${data.description}</description>
  <link>${url}</link>
  <generator>${data.siteName}</generator>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${url}/rss" rel="self" type="application/rss+xml"/>
  <language><![CDATA[ja]]></language>
  ${items.join("\n")}
  </channel>`;

  const rss = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  ${channel}
  </rss>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>${rss}`;

  return new Response(xml, { headers: {
    "Content-Type": "application/rss+xml; charset=UTF-8",
  }});
}
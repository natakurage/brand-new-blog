import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager } from "@/lib/cms";
import { ORIGIN } from "@/lib/config";
import { absoluteUrlOf } from "@/lib/content/href";
import { describe } from "@/lib/content/summary";

export async function GET() {
  const data = await loadGlobalSettings();

  const { items: posts } = await new BlogPostManager().getNewest({
    page: 0,
    limit: data.itemsPerPage,
  });

  const items = posts.map(post => `<item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${describe(post)}]]></description>
      <link>${absoluteUrlOf(post, ORIGIN)}</link>
      <guid isPermaLink="false">${absoluteUrlOf(post, ORIGIN)}</guid>
      <dc:creator><![CDATA[${data.author}]]></dc:creator>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
    </item>`
  );

  const channel = `<channel>
  <title>${data.siteName}</title>
  <description>${data.description}</description>
  <link>${ORIGIN}</link>
  <generator>${data.siteName}</generator>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${new URL('/rss', ORIGIN).href}" rel="self" type="application/rss+xml"/>
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
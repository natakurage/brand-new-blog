import { repositories } from "@/lib/repositories";
import { ORIGIN } from "@/lib/config";
import { absoluteUrlOf } from "@/lib/content/href";
import { describe } from "@/lib/content/summary";

export async function GET() {
  const data = await repositories.siteSettings.get();

  const { items: posts } = await repositories.articles.list(
    { page: { page: 1, size: data.itemsPerPage } },
  );

  const lastBuildDate = posts.length > 0
    ? `<lastBuildDate>${new Date(Math.max(...posts.map((post) => post.updatedAt.getTime()))).toUTCString()}</lastBuildDate>`
    : "";

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
  ${lastBuildDate}
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
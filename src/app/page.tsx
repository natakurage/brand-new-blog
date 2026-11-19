import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager } from "@/lib/cms";
import Script from "next/script";
import type { WebSite, WithContext } from "schema-dts";
import { ORIGIN } from "@/lib/config";
import { pageHref } from "@/lib/content/href";

export async function generateMetadata() {
  const data = await loadGlobalSettings();
  return {
    title: data.siteName,
  };
}

async function JsonLD() {
  const data = await loadGlobalSettings();
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.siteName,
    url: ORIGIN,
    description: data.description,
    image: new URL("/banner.png", ORIGIN).href,
    potentialAction: {
      "@type": "SearchAction",
      target: new URL("/search?q={search_term_string}", ORIGIN).href,
      // @ts-expect-error: 'query-input' is not in the schema-dts types but required by schema.org
      "query-input": "required name=search_term_string"
    },
  };

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function Home() {
  const pageNum = 1;
  const data = await loadGlobalSettings();
  const manager = new BlogPostManager();
  const { items: posts, total, limit } = await manager.getNewest({
    page: pageNum - 1,
    limit: data.itemsPerPage,
  });
  return (
    <>
      <JsonLD />
      <ItemList hrefFor={(n) => pageHref("/articles", n)} items={posts} page={pageNum} total={total} limit={limit} showCount={false} showExporter={false} />
    </>
  );
}

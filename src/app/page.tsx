import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/globalSettings";
import { BlogPostManager } from "@/lib/contentful";
import Script from "next/script";
import type {  WebSite, WithContext } from "schema-dts";

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
    url: process.env.NEXT_PUBLIC_ORIGIN,
    description: data.description,
    image: new URL("/banner.png", process.env.NEXT_PUBLIC_ORIGIN).href,
    potentialAction: {
      "@type": "SearchAction",
      target: new URL("/search?q={search_term_string}", process.env.NEXT_PUBLIC_ORIGIN).href,
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

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items: posts, total, limit } = await new BlogPostManager().query({
    page: pageNum - 1,
    filter: { order: "-sys.createdAt" },
  });
  return (
    <>
      <JsonLD />
      <ItemList items={posts} page={pageNum} total={total} limit={limit} />
    </>
  );
}

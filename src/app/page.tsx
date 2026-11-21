import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";
import StructuredData from "@/components/StructuredData";
import type { WebSite, WithContext } from "schema-dts";
import { ORIGIN } from "@/lib/config";
import { pageHref } from "@/lib/content/href";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const data = await repositories.siteSettings.get();
  return {
    title: data.siteName,
    ...pageMetadata(data, "/"),
  };
}

async function JsonLD() {
  const data = await repositories.siteSettings.get();
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.siteName,
    url: ORIGIN,
    description: data.description,
    image: new URL("/opengraph-image", ORIGIN).href,
    potentialAction: {
      "@type": "SearchAction",
      target: new URL("/search?q={search_term_string}", ORIGIN).href,
      // @ts-expect-error: 'query-input' is not in the schema-dts types but required by schema.org
      "query-input": "required name=search_term_string"
    },
  };

  return (
    <StructuredData data={jsonLd} />
  );
}

export default async function Home() {
  const pageNum = 1;
  const data = await repositories.siteSettings.get();
  const { items: posts, total } = await repositories.articles.list(
    { page: { page: pageNum, size: data.itemsPerPage } },
  );
  return (
    <>
      <JsonLD />
      <ItemList hrefFor={(n) => pageHref("/articles", n)} items={posts} page={pageNum} total={total} limit={data.itemsPerPage} showCount={false} showExporter={false} />
    </>
  );
}

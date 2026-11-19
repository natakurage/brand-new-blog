import { cache } from "react";
import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";
import { hrefOf, pageHref } from "@/lib/content/href";

const getList = cache((slug: string) => (
  repositories.postLists.findBySlug(slug, { preview: false })
));

export async function generateMetadata(props: { params: Promise<{ slug: string, page: string }> }) {
  const params = await props.params;
  const data = await repositories.siteSettings.get();
  const { slug } = params;
  const list = await getList(slug);
  if (!list) { 
    notFound();
  }
  const title = `記事リスト ${data.siteName}` + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export async function generateStaticParams() {
  const slugs = await repositories.postLists.allSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

export default async function ListsPage(props: { params: Promise<{ slug: string, page: string }> }) {
  const params = await props.params;
  const { slug, page } = params;
  const data = await repositories.siteSettings.get();
  const pageNum = Number(page);
  const list = await getList(slug);
  if (!list) { 
    notFound();
  }
  const length = list.items.length;
  const posts = list.items.slice((pageNum - 1) * data.itemsPerPage, pageNum * data.itemsPerPage);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ItemList
        hrefFor={(n) => pageHref(hrefOf(list), n)}
        items={posts}
        total={length}
        page={pageNum}
        limit={data.itemsPerPage}
        suffix={`?key=${list.slug}`}
      />
    </div>
  );
}

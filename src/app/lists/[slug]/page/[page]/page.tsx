import { cache } from "react";
import { parseParams, SlugPageParams } from "@/lib/params";
import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";
import { hrefOf, pageHref } from "@/lib/content/href";
import { hasPage, pageOf } from "@/lib/content/pagination";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";
// params を Suspense の外で読むので、移動では枠を先に出さず完成を待つ（fallback を置いていないため、空の枠より前のページのまま待つほうがよい）
export const instant = false;

const getList = cache((slug: string) => (
  repositories.postLists.findBySlug(slug)
));

export async function generateMetadata(props: PageProps<"/lists/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug } = params;
  const list = await getList(slug);
  if (!list) { 
    notFound();
  }
  const title = `記事リスト ${data.siteName}` + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
}

export async function generateStaticParams() {
  const slugs = await repositories.postLists.allSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

export default async function ListsPage(props: PageProps<"/lists/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const { slug, page } = params;
  const data = await repositories.siteSettings.get();
  const pageNum = page;
  const list = await getList(slug);
  if (!list) { 
    notFound();
  }
  const request = { page: pageNum, size: data.itemsPerPage };
  const { items: posts, total } = pageOf(list.items, request);
  if (!hasPage(total, request)) {
    notFound();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ItemList
        hrefFor={(n) => pageHref(hrefOf(list), n)}
        items={posts}
        total={total}
        page={pageNum}
        limit={data.itemsPerPage}
        context={list}
      />
    </div>
  );
}

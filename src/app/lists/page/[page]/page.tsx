import ListList from "@/components/ListList";
import { parseParams, PageParams } from "@/lib/params";
import { repositories } from "@/lib/repositories";
import { pageHref } from "@/lib/content/href";
import { hasPage } from "@/lib/content/pagination";
import { notFound } from "next/navigation";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";
// params を Suspense の外で読むので、移動では枠を先に出さず完成を待つ（fallback を置いていないため、空の枠より前のページのまま待つほうがよい）
export const instant = false;

export async function generateMetadata(props: PageProps<"/lists/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const title = "記事リスト一覧 - " + data.siteName + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
}

export function generateStaticParams() {
  return [{ page: "1" }];
}

export default async function ListsPage(props: PageProps<"/lists/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const pageNum = params.page;
  const request = { page: pageNum, size: data.itemsPerPage };
  const { items, total } = await repositories.postLists.list(request);
  if (!hasPage(total, request)) {
    notFound();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">リスト一覧</h1>
      <ListList hrefFor={(n) => pageHref("/lists", n)} lists={items} total={total} page={pageNum} limit={data.itemsPerPage} />
    </div>
  );
}
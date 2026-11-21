import ListList from "@/components/ListList";
import { parseParams, PageParams } from "@/lib/params";
import { repositories } from "@/lib/repositories";
import { pageHref } from "@/lib/content/href";
import { notFound } from "next/navigation";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";

export async function generateMetadata(props: PageProps<"/albums/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const title = "アルバム一覧 - " + data.siteName + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
}

export function generateStaticParams() {
  return [{ page: "1" }];
}

export default async function AlbumsPage(props: PageProps<"/albums/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const pageNum = params.page;
  const { items, total } = await repositories.albums.list(
    { page: pageNum, size: data.itemsPerPage },
  );
  if (items.length === 0) {
    return notFound();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">アルバム一覧</h1>
      <ListList hrefFor={(n) => pageHref("/albums", n)} lists={items} total={total} page={pageNum} limit={data.itemsPerPage} />
    </div>
  );
}
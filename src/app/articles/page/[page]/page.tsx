import ItemList from "@/components/ItemList";
import { parseParams, PageParams } from "@/lib/params";
import { repositories } from "@/lib/repositories";
import { pageHref } from "@/lib/content/href";
import { notFound } from "next/navigation";

export async function generateMetadata(props: PageProps<"/articles/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const title = "記事一覧 - " + data.siteName + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function ArticlesPage(props: PageProps<"/articles/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const pageNum = params.page;
  const { items: posts, total } = await repositories.articles.list(
    { page: { page: pageNum, size: data.itemsPerPage } },
    { preview: false },
  );
  if (posts.length === 0) {
      return notFound();
    }
  return (
    <ItemList hrefFor={(n) => pageHref("/articles", n)} items={posts} page={pageNum} total={total} limit={data.itemsPerPage} />
  );
}

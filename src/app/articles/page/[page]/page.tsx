import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const data = await loadGlobalSettings();
  const title = "記事一覧 - " + data.siteName + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function ArticlesPage(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const pageNum = Number(params.page);
  const manager = new BlogPostManager();
  const { items: posts, total, limit } = await manager.getNewest({
    page: pageNum - 1,
    limit: 10,
  });
  if (posts.length === 0) {
      return notFound();
    }
  return (
    <ItemList basePath="/articles" items={posts} page={pageNum} total={total} limit={limit} />
  );
}

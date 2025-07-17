import ListList from "@/components/ListList";
import { loadGlobalSettings } from "@/lib/cmsUtils";
import { PostListManager } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { page: string } }) {
  const data = await loadGlobalSettings();
  const title = "記事リスト一覧 - " + data.siteName + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function ListsPage({ params }: { params: { page: string } }) {
  const pageNum = Number(params.page);
  const { items, limit } = await new PostListManager().getNewest({
    page: pageNum - 1,
    limit: 10,
  });
  if (items.length === 0) {
      return notFound();
    }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">リスト一覧</h1>
      <ListList basePath="/lists" lists={items} total={items.length} page={pageNum} limit={limit} />
    </div>
  );
}
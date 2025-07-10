import ListList from "@/components/ListList";
import { loadGlobalSettings } from "@/lib/globalSettings";
import { PostListManager } from "@/lib/contentful";

export async function generateMetadata(){
  const data = await loadGlobalSettings();
  return {
    title: "記事リスト一覧 - " + data.siteName,
  };
}

export default async function ListPage({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items, limit } = await new PostListManager().query({});
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">リスト一覧</h1>
      <ListList lists={items} total={items.length} page={pageNum} limit={limit} />
    </div>
  );
}
import ListList from "@/components/ListList";
import { getLists } from "@/lib/contentful";

export default async function ListPage({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { lists, limit } = await getLists({});
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">リスト一覧</h1>
      <ListList lists={lists} total={lists.length} page={pageNum} limit={limit} />
    </div>
  );
}
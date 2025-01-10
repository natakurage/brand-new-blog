import ListList from "@/components/ListList";
import { PostListManager } from "@/lib/contentful";
import { Metadata } from "next";
import data from "@/app/data/data.json";

export const metadata: Metadata = {
  title: "記事リスト一覧 - " + data.siteName,
};

export default async function ListPage({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { lists, limit } = await new PostListManager().query({});
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">リスト一覧</h1>
      <ListList lists={lists} total={lists.length} page={pageNum} limit={limit} />
    </div>
  );
}
import ArticleList from "@/components/ArticleList";
import { getList } from "@/lib/contentful";
import { notFound } from "next/navigation";

export default async function ListsPage(
  { params, searchParams }
  : { params: { id: string }, searchParams: { page?: string } }
) {
  const { id } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  let list = null;
  try {
    list = await getList(id, false);
  } catch (error) {
    console.error(error);
    notFound();
  }
  const posts = list?.posts ?? [];
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ArticleList posts={posts} total={posts.length} page={pageNum} limit={10} />
    </div>
  );
}
import ArticleList from "@/components/ArticleList";
import { getList } from "@/lib/contentful";
import { notFound } from "next/navigation";
import data from "@/app/data/data.json";

export async function generateMetadata ({ params }: { params: { id: string } }) {
  const { id } = params;
  const list = await getList(id, false);
  if (!list) { 
    notFound();
  }
  return {
    title: `記事リスト "${list.title}"` + " - " + data.siteName,
  };
}

export default async function ListsPage(
  { params, searchParams }
  : { params: { id: string }, searchParams: { page?: string } }
) {
  const { id } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const list = await getList(id, false);
  if (!list) { 
    notFound();
  }
  const posts = list?.posts ?? [];
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ArticleList
        posts={posts}
        total={posts.length}
        page={pageNum}
        limit={10}
        suffix={`?listId=${list.id}`}
      />
    </div>
  );
}
import { cache } from "react";
import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { PostListManager } from "@/lib/cms";
import { notFound } from "next/navigation";

const getList = cache((id: string) => (
  new PostListManager().get(id, false)
));

export async function generateMetadata ({ params }: { params: { id: string, page: string } }) {
  const data = await loadGlobalSettings();
  const { id } = params;
  const list = await getList(id);
  if (!list) { 
    notFound();
  }
  const title = `記事リスト ${data.siteName}` + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export async function generateStaticParams() {
  const ids = await new PostListManager().getAllIds();
  return ids.map((id) => ({ id }));
}

export default async function ListsPage( { params } : { params: { id: string, page: string } }
) {
  const { id, page } = params;
  const pageNum = Number(page);
  const list = await getList(id);
  if (!list) { 
    notFound();
  }
  const posts = list.items;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ItemList
        basePath={`/articles/${list.id}`}
        items={posts}
        total={posts.length}
        page={pageNum}
        limit={10}
        suffix={`?key=${list.id}`}
      />
    </div>
  );
}
import { cache } from "react";
import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { PostListManager } from "@/lib/cms";
import { notFound } from "next/navigation";

const getList = cache((id: string) => (
  new PostListManager().get(id, false)
));

export async function generateMetadata(props: { params: Promise<{ id: string, page: string }> }) {
  const params = await props.params;
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
  return ids.map((id) => ({ id, page: "1" }));
}

export default async function ListsPage(props: { params: Promise<{ id: string, page: string }> }) {
  const params = await props.params;
  const { id, page } = params;
  const pageNum = Number(page);
  const list = await getList(id);
  if (!list) { 
    notFound();
  }
  const length = list.items.length;
  const posts = list.items.slice((pageNum - 1) * 10, pageNum * 10);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">記事リスト &ldquo;{list.title}&rdquo;</h1>
      <p className="text-sm">{list.description}</p>
      <ItemList
        basePath={`/lists/${list.id}`}
        items={posts}
        total={length}
        page={pageNum}
        limit={10}
        suffix={`?key=${list.id}`}
      />
    </div>
  );
}
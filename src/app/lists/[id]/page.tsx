import { cache } from "react";
import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/globalSettings";
import { PostListManager } from "@/lib/contentful";
import { notFound } from "next/navigation";

const getList = cache((id: string) => (
  new PostListManager().get(id, false)
));

export async function generateMetadata ({ params }: { params: { id: string } }) {
  const data = await loadGlobalSettings();
  const { id } = params;
  const list = await getList(id);
  if (!list) { 
    notFound();
  }
  return {
    title: `記事リスト "${list.title}"` + " - " + data.siteName,
  };
}

export const revalidate = 60 * 60 * 24; // 1 day

export async function generateStaticParams() {
  const ids = await new PostListManager().getAllIds();
  return ids.map((id) => ({ id }));
}

export default async function ListsPage(
  { params, searchParams }
  : { params: { id: string }, searchParams: { page?: string } }
) {
  const { id } = params;
  const { page = 1 } = searchParams;
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
        items={posts}
        total={posts.length}
        page={pageNum}
        limit={10}
        suffix={`?key=${list.id}`}
      />
    </div>
  );
}
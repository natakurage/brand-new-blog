import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager } from "@/lib/cms";

export async function generateMetadata ({ searchParams }: { searchParams: { q: string } }) {
  const { q } = searchParams;
  const data = await loadGlobalSettings();
  return {
    title: `"${q}"の検索結果` + " - " + data.siteName,
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { q: string, page?: string } }) {
  const { q, page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items: posts, total, limit } = await new BlogPostManager().query({
    filter: { query: q },
    page: pageNum - 1
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">&ldquo;{q}&rdquo;の検索結果</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList items={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
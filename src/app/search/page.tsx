import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager } from "@/lib/cms";

export async function generateMetadata(props: { searchParams: Promise<{ q: string }> }) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;
  const data = await loadGlobalSettings();
  return {
    title: `"${q}"の検索結果` + " - " + data.siteName,
    robots: {
      index: false
    }
  };
}

export default async function SearchPage(props: { searchParams: Promise<{ q: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const { q, page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items: posts, total, limit } = await new BlogPostManager().fullTextSearch(
    q,
    false,
    {
      limit: 10,
      page: pageNum - 1
    }
  );
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">&ldquo;{q}&rdquo;の検索結果</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList
              basePath={`/search?q=${q}`}
              items={posts}
              total={total}
              page={pageNum}
              limit={limit}
              useQueryParam={true}
            />
      }
    </div>
  );
}
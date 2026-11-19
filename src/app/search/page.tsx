import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";

const searchHref = (q: string, n: number): string => {
  const params = new URLSearchParams({ q });
  if (n !== 1) {
    params.set("page", String(n));
  }
  return `/search?${params}`;
};

export async function generateMetadata(props: { searchParams: Promise<{ q: string }> }) {
  const searchParams = await props.searchParams;
  const { q } = searchParams;
  const data = await repositories.siteSettings.get();
  return {
    title: `"${q}"の検索結果` + " - " + data.siteName,
    robots: {
      index: false
    }
  };
}

export default async function SearchPage(props: { searchParams: Promise<{ q: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const data = await repositories.siteSettings.get();
  const { q, page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items: posts, total } = await repositories.articles.search(
    q,
    { page: pageNum, size: data.itemsPerPage },
    { preview: false },
  );
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">&ldquo;{q}&rdquo;の検索結果</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList
              hrefFor={(n) => searchHref(q, n)}
              items={posts}
              total={total}
              page={pageNum}
              limit={data.itemsPerPage}
            />
      }
    </div>
  );
}
import * as v from "valibot";
import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";
import { PageNumber, parseSearchParams } from "@/lib/params";

const SearchParams = v.object({
  q: v.optional(v.pipe(v.string(), v.trim())),
  page: v.optional(PageNumber),
});

const searchHref = (q: string, n: number): string => {
  const params = new URLSearchParams({ q });
  if (n !== 1) {
    params.set("page", String(n));
  }
  return `/search?${params}`;
};

export async function generateMetadata(props: PageProps<"/search">) {
  const { q } = parseSearchParams(SearchParams, await props.searchParams);
  const data = await repositories.siteSettings.get();
  return {
    title: (q ? `"${q}"の検索結果` : "検索") + " - " + data.siteName,
    robots: {
      index: false
    }
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const { q, page: pageNum = 1 } = parseSearchParams(SearchParams, await props.searchParams);
  if (!q) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">検索</h1>
        <p className="my-4">検索語を入力してください。</p>
      </div>
    );
  }
  const data = await repositories.siteSettings.get();
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

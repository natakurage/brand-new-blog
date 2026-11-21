import { Suspense } from "react";
import * as v from "valibot";
import ItemList from "@/components/ItemList";
import { repositories } from "@/lib/repositories";
import { PageNumber, parseSearchParams } from "@/lib/params";
import { searchHref } from "@/lib/content/href";

const SearchParams = v.object({
  q: v.optional(v.pipe(v.string(), v.trim())),
  page: v.optional(PageNumber),
});

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

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">検索</h1>
      <p className="my-4">検索中…</p>
    </div>
  );
}

async function SearchResults(props: Pick<PageProps<"/search">, "searchParams">) {
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

import ArticleList from "@/components/ArticleList";
import client from "@/lib/contentful";

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const { q } = searchParams;
  const entries = await client.getEntries({
    content_type: "blogPost",
    query: q,
    limit: 20,
  });
  console.log(entries.items);
  return (
    <div>
      <h1 className="text-3xl font-bold">&ldquo;{q}&rdquo;の検索結果</h1>
      {
        entries.items.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ArticleList entries={entries} />
      }
    </div>
  );
}
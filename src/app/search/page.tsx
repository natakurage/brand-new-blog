import ArticleList from "@/components/ArticleList";
import { getPosts } from "@/lib/contentful";

export async function generateMetadata ({ searchParams }: { searchParams: { q: string } }) {
  const { q } = searchParams;
  return {
    title: `"${q}"の検索結果` + " - ナタクラゲのブログ",
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { q: string, page?: string } }) {
  const { q, page = 1 } = searchParams;
  const pageNum = Number(page);
  const { posts, total, limit } = await getPosts({
    filter: { query: q },
    offset: pageNum - 1
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">&ldquo;{q}&rdquo;の検索結果</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ArticleList posts={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
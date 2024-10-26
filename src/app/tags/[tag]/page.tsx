import ArticleList from "@/components/ArticleList";
import { getPosts } from "@/lib/contentful";

export async function generateMetadata ({ params }: { params: { tag: string } }) {
  const { tag: temp } = params;
  const tag = decodeURIComponent(temp);
  return {
    title: `タグ #${tag} がつけられた記事` + " - ナタクラゲのブログ",
  };
}

export default async function TagPage({ params, searchParams }: { params: { tag: string }, searchParams: { page?: string } }) {
  const { tag: temp } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const tag = decodeURIComponent(temp);
  const { posts, total, limit } = await getPosts({
    filter: {"fields.tags[in]": tag},
    offset: pageNum - 1,
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">タグ #{tag} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ArticleList posts={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
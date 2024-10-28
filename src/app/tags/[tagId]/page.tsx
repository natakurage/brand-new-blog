import ArticleList from "@/components/ArticleList";
import { getPosts, getTagWithCache } from "@/lib/contentful";
import data from "@/app/data/data.json";

export async function generateMetadata ({ params }: { params: { tagId: string } }) {
  const { tagId } = params;
  const tag = await getTagWithCache(tagId);
  return {
    title: `タグ #${tag.name} がつけられた記事` + " - " + data.siteName,
  };
}

export default async function TagPage({ params, searchParams }: { params: { tagId: string }, searchParams: { page?: string } }) {
  const { tagId } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const tag = await getTagWithCache(tagId);
  const { posts, total, limit } = await getPosts({
    filter: {"metadata.tags.sys.id[all]": tag.sys.id},
    offset: pageNum - 1,
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">タグ #{tag.name} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ArticleList posts={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
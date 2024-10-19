import ArticleList from "@/components/ArticleList";
import getPosts from "@/lib/contentful";

export async function generateMetadata ({ params }: { params: { tag: string } }) {
  const { tag } = params;
  return {
    title: `タグ #${tag} がつけられた記事` + " - ナタクラゲのブログ",
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = params;
  const posts = await getPosts({
    content_type: "blogPost",
    "fields.tags[in]": tag,
    limit: 20,
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">タグ #{tag} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ArticleList posts={posts} />
      }
    </div>
  );
}
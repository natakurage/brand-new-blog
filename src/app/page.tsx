import ArticleList from "@/components/ArticleList";
import getPosts from "@/lib/contentful";

export default async function Home() {
  const posts = await getPosts({
    content_type: "blogPost",
    limit: 20,
  });
  return (
    <div>
      <ArticleList posts={posts} />
    </div>
  );
}

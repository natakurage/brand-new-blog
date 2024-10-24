import ArticleList from "@/components/ArticleList";
import { getPosts } from "@/lib/contentful";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ナタクラゲのブログ",
};

const postsPerPage = 5;

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { posts, total } = await getPosts({
    limit: postsPerPage,
    offset: pageNum - 1
  });
  return (
    <ArticleList posts={posts} page={pageNum} total={total} postsPerPage={postsPerPage} />
  );
}

import ArticleList from "@/components/ArticleList";
import { getPosts } from "@/lib/contentful";
import { Metadata } from "next";
import data from "@/app/data/data.json";

export const metadata: Metadata = {
  title: data.siteName,
};

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { posts, total, limit } = await getPosts({
    offset: pageNum - 1
  });
  return (
    <ArticleList posts={posts} page={pageNum} total={total} limit={limit} />
  );
}

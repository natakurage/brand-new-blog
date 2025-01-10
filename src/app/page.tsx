import ItemList from "@/components/ItemList";
import { BlogPostManager } from "@/lib/contentful";
import { Metadata } from "next";
import data from "@/app/data/data.json";

export const metadata: Metadata = {
  title: data.siteName,
};

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const { items: posts, total, limit } = await new BlogPostManager().query({
    offset: pageNum - 1,
    filter: { order: "-sys.createdAt" },
  });
  return (
    <ItemList items={posts} page={pageNum} total={total} limit={limit} />
  );
}

import ArticleList from "@/components/ArticleList";
import client from "@/lib/contentful";

export default async function Home() {
  const entries = await client.getEntries({
    content_type: "blogPost",
    limit: 20,
  });
  console.log(entries.items);
  return (
    <div>
      <ArticleList entries={entries} />
    </div>
  );
}

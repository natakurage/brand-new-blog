import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager, getAllTags, getTagWithCache } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata ({ params }: { params: { slug: string, page: number } }) {
  const { slug, page } = params;
  const tag = await getTagWithCache(slug);
  if (!tag) {
    notFound();
  }
  const data = await loadGlobalSettings();
  const title = `タグ #${tag.name} がつけられた記事` + " - " + data.siteName + (page === 1 ? "" : `: Page ${page}`);
  return { title };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export default async function TagPage({ params }: { params: { slug: string, page: string } }) {
  const { slug, page } = params;
  const pageNum = Number(page);
  const tag = await getTagWithCache(slug);
  if (!tag) {
    notFound();
  }
  const { items: posts, total, limit } = await new BlogPostManager().getByTag(
    tag.slug,
    false,
    {
      limit: 10,
      page: pageNum - 1,
    }
  );
  if (posts.length === 0) {
    return notFound();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">タグ #{tag.name} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList basePath={`/tags/${tag.slug}`} items={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
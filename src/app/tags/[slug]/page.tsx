import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/contentful/globalSettings";
import { BlogPostManager, getAllTags, getTagWithCache } from "@/lib/contentful/managers";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const tag = await getTagWithCache(slug);
  const data = await loadGlobalSettings();
  return {
    title: `タグ #${tag.name} がつけられた記事` + " - " + data.siteName,
  };
}

export const revalidate = 60 * 60 * 24; // 1 day

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export default async function TagPage({ params, searchParams }: { params: { slug: string }, searchParams: { page?: string } }) {
  const { slug } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const tag = await getTagWithCache(slug);
  const { items: posts, total, limit } = await new BlogPostManager().query({
    filter: {"metadata.tags.sys.id[all]": tag.slug},
    page: pageNum - 1,
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">タグ #{tag.name} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList items={posts} total={total} page={pageNum} limit={limit} />
      }
    </div>
  );
}
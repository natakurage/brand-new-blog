import ItemList from "@/components/ItemList";
import ContentWarning from "@/components/ContentWarning";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";
import { hrefOf, pageHref } from "@/lib/content/href";

export async function generateMetadata(props: { params: Promise<{ slug: string, page: number }> }) {
  const params = await props.params;
  const { slug, page } = params;
  const tag = await repositories.tags.findBySlug(slug, { preview: false });
  if (!tag) {
    notFound();
  }
  const data = await repositories.siteSettings.get();
  const title = `タグ #${tag.name} がつけられた記事` + " - " + data.siteName + (page === 1 ? "" : `: Page ${page}`);
  return { title };
}

export async function generateStaticParams() {
  const slugs = await repositories.tags.allSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

export default async function TagPage(props: { params: Promise<{ slug: string, page: string }> }) {
  const params = await props.params;
  const data = await repositories.siteSettings.get();
  const { slug, page } = params;
  const pageNum = Number(page);
  const tag = await repositories.tags.findBySlug(slug, { preview: false });
  if (!tag) {
    notFound();
  }
  const { items: posts, total } = await repositories.articles.list(
    { page: { page: pageNum, size: data.itemsPerPage }, tag: tag.slug },
    { preview: false },
  );
  if (posts.length === 0) {
    return notFound();
  }
  return (
    <div className="space-y-4">
      { tag.contentWarning && <ContentWarning warningContent={tag.contentWarning} /> }
      <h1 className="text-3xl font-bold">タグ #{tag.name} がつけられた記事</h1>
      {
        posts.length === 0
          ? <p className="my-4">記事が見つかりません。</p>
          : <ItemList hrefFor={(n) => pageHref(hrefOf(tag), n)} items={posts} total={total} page={pageNum} limit={data.itemsPerPage} />
      }
    </div>
  );
}
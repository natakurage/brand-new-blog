import ItemList from "@/components/ItemList";
import { parseParams, SlugPageParams } from "@/lib/params";
import ContentWarning from "@/components/ContentWarning";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";
import { hrefOf, pageHref } from "@/lib/content/href";
import { hasPage } from "@/lib/content/pagination";
import { pageMetadata } from "@/lib/metadata";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";
// params を Suspense の外で読むので、移動では枠を先に出さず完成を待つ（fallback を置いていないため、空の枠より前のページのまま待つほうがよい）
export const instant = false;

export async function generateMetadata(props: PageProps<"/tags/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const { slug, page } = params;
  const tag = await repositories.tags.findBySlug(slug);
  if (!tag) {
    notFound();
  }
  const data = await repositories.siteSettings.get();
  const title = `タグ #${tag.name} がつけられた記事` + " - " + data.siteName + (page === 1 ? "" : `: Page ${page}`);
  return { title, ...pageMetadata(data, pageHref(hrefOf(tag), page)) };
}

export async function generateStaticParams() {
  const slugs = await repositories.tags.allSlugs();
  return slugs.map((slug) => ({ slug, page: "1" }));
}

export default async function TagPage(props: PageProps<"/tags/[slug]/page/[page]">) {
  const params = parseParams(SlugPageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug, page } = params;
  const pageNum = page;
  const tag = await repositories.tags.findBySlug(slug);
  if (!tag) {
    notFound();
  }
  const request = { page: pageNum, size: data.itemsPerPage };
  const { items: posts, total } = await repositories.articles.list({ page: request, tag: tag.slug });
  if (!hasPage(total, request)) {
    notFound();
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
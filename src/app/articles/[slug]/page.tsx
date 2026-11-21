import { parseParams, SlugParams } from "@/lib/params";
import { notFound } from "next/navigation";
import { BlogPost } from "@/lib/content/types";
import { getShareInfo } from "@/lib/content/share";
import { getCreditText } from "@/lib/content/credit";
import { repositories } from "@/lib/repositories";
import { isPreview } from "@/lib/preview";
import { Suspense } from "react";
import type { WithContext, BlogPosting } from "schema-dts";
import { RelatedPosts } from "@/components/RelatedPosts";
import ListNavigator from "@/components/ListNavigator";
import { navigationsFor } from "@/lib/content/navigation";
import ShareButtons from "@/components/ShareButtons";
import ArticleBody from "@/components/ArticleBody";
import HeaderTime from "@/components/HeaderTime";
import TagList from "@/components/TagList";
import HeaderAuthor from "@/components/HeaderAuthor";
import Credit from "@/components/Credit";
import ContentWarning from "@/components/ContentWarning";
import StructuredData from "@/components/StructuredData";
import { licenseUrl } from "@/lib/content/license";
import Image from "next/image";
import Link from "next/link";
import { CALENDAR, ORIGIN } from "@/lib/config";
import { siteOpenGraph } from "@/lib/metadata";
import { absoluteUrlOf, ogImageHref, rawHref } from "@/lib/content/href";
import { describe } from "@/lib/content/summary";

// 完成したページを返す。作り置きにない URL は完成を待ってから返すので、存在しなければ 404 になる（待たないと、先に枠を 200 で送ってしまう）
export const ensureStatic = "navigation";

export async function generateMetadata(props: PageProps<"/articles/[slug]">) {
  const params = parseParams(SlugParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug } = params;
  const post = await repositories.articles.findBySlug(slug);
  if (!post) {
    notFound();
  }
  const title = post.title + " - " + data.siteName;
  const description = describe(post) || data.description;
  return {
    title: (await isPreview() ? "(プレビュー)" : "") + title,
    description: description,
    alternates: {
      types: {
        "text/markdown": rawHref(post, "md"),
        "text/plain": rawHref(post, "txt"),
      },
    },
    openGraph: {
      ...siteOpenGraph(data),
      title: title,
      description: description,
      url: absoluteUrlOf(post, ORIGIN),
    }
  };
}

export async function generateStaticParams() {
  const slugs = await repositories.articles.allSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function JsonLD({ post }: { post: BlogPost }) {
  const data = await repositories.siteSettings.get();
  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: describe(post),
    url: absoluteUrlOf(post, ORIGIN),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: [new URL(ogImageHref(post), ORIGIN).href],
    author: [
      {
        "@type": "Person",
        name: data.author,
        url: data.authorUrl || undefined,
        image: data.avatar
      }
    ],
    license: licenseUrl(post.license),
  };

  return (
    <StructuredData data={jsonLd} />
  );
}

export default async function ArticlePage(props: PageProps<"/articles/[slug]">) {
  const params = parseParams(SlugParams, await props.params);
  const data = await repositories.siteSettings.get();
  const { slug } = params;
  const post = await repositories.articles.findBySlug(slug);
  if (!post) {
    notFound();
  }

  const firstSix = { page: 1, size: 6 };
  const [
    relatedPosts,
    { items: newPosts },
    { items: recommendedPosts },
    navigations,
  ] = await Promise.all([
    repositories.articles.related(post, 6),
    repositories.articles.list({ page: firstSix, exclude: [post.slug] }),
    repositories.articles.list({ page: firstSix, slugs: data.recommendedPosts }),
    navigationsFor(post.slug, repositories.postLists),
  ]);

  const shareInfo = getShareInfo(post, data.siteName, ORIGIN);

  const contentWarnings = post.tags.map((tag) => tag.contentWarning).filter((cw): cw is string => !!cw);

  const creditText = getCreditText(post, data.author, ORIGIN, CALENDAR);
  const shareFullText = `# ${post.title}\n\n ${post.content}\n\n---\n\n${creditText}`;
  return (
    <>
      <JsonLD post={post} />
      <main className="space-y-5">
        {
          contentWarnings.map((warningContent, index) => (
            <ContentWarning key={index} warningContent={warningContent} />
          ))
        }
        <article>
          {
            post.mainImage && (
              <Image
                src={post.mainImage}
                alt={post.title}
                width={800}
                height={400}
                priority
                className="w-full h-auto mb-20"
              />
            )
          }
          <header className="space-y-5">
            <h1 className="text-4xl font-bold">{post.title}</h1>
            {post.description && <p className="text-sm">{post.description}</p>}
            <TagList tags={post.tags} />
            <div className="text-sm flex flex-wrap">
              <HeaderAuthor author={data.author} avatar={data.avatar} donate={data.donate} donateURL={data.donateUrl} className="me-auto" />
              <HeaderTime item={post} createdAt={post.createdAt} updatedAt={post.updatedAt} length={post.length} readingMinutes={post.readingMinutes} className="ms-auto" />
            </div>
          </header>
          <ArticleBody content={post.content} className="my-12 sm:my-24" />
          <footer className="space-y-5">
            <Suspense>
              <ListNavigator navigations={navigations} />
            </Suspense>
            <ShareButtons shareText={shareInfo.text} shareUrl={shareInfo.url} fullText={shareFullText} />
            <Credit
              title={post.title}
              author={data.author}
              url={shareInfo.url}
              year={CALENDAR.year(post.createdAt)}
              workType="記事"
              license={post.license}
            />
            <section className="border border-base-content border-dashed rounded p-3 space-y-2">
              <h2 className="text-2xl font-bold">別の形式</h2>
              <Link href={rawHref(post, "md")} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Markdown版
              </Link>
              <Link href={rawHref(post, "txt")} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline ms-4">
                プレーンテキスト版
              </Link>
            </section>
          </footer>
        </article>
        <aside className="space-y-4" aria-label="こちらもおすすめ">
        {
          data.showRelatedPosts && relatedPosts.length > 0 && <section>
            <h2 className="text-2xl font-bold">関連記事</h2>
            <RelatedPosts posts={relatedPosts} />
          </section>
        }
        {
          data.showNewPosts && newPosts.length > 0 && <section>
            <h2 className="text-2xl font-bold">新着記事</h2>
            <RelatedPosts posts={newPosts} />
          </section>
        }
        {
          recommendedPosts.length > 0 && <section>
            <h2 className="text-2xl font-bold">おすすめ記事</h2>
            <RelatedPosts posts={recommendedPosts} />
          </section>
        }
        </aside>
      </main>
    </>
  );
}
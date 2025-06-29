import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { BlogPostManager } from "@/lib/contentful";
import { FaScrewdriverWrench } from "react-icons/fa6";
import { draftMode } from "next/headers";
import React, { Suspense } from "react";
import data from "@/app/data/data.json";
import { RelatedPosts } from "@/components/RelatedPosts";
import ListNavigator from "@/components/ListNavigator";
import ShareButtons from "@/components/ShareButtons";
import PreviewWarning from "@/components/PreviewWarning";
import ArticleBody from "@/components/ArticleBody";
import removeMd from "remove-markdown";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const post = await new BlogPostManager().getBySlug(slug, isEnabled);
  if (!post) {
    notFound();
  }
  const title = post.title + " - " + data.siteName;
  const ogpImageUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
  ogpImageUrl.searchParams.set("title", title);
  return {
    title,
    openGraph: {
      title: title,
      description: removeMd(post.content).slice(0, 100) || data.description,
      url: new URL(`/articles/${post.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href,
      images: [
        {
          url: ogpImageUrl.href,
          width: 1200,
          height: 630,
          alt: post.title + " OGP"
        }
      ]
    }
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await new BlogPostManager().getAllSlugs();
  return slugs.map((slug) => ({ slug, key: undefined }));
}

export default async function ArticlePage(
  { params } : { params: { slug: string } }
) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const manager = new BlogPostManager();
  const post = await manager.getBySlug(slug, isEnabled);
  if (!post) {
    notFound();
  }

  const [
    { items: relatedPosts },
    { items: newPosts },
    { items: recommendedPosts }
  ] = await Promise.all([
    manager.getRelatedPosts({
      slug: post.slug,
      tagIds: post.tags?.map((tag) => tag.sys.id),
    }),
    manager.query({
      limit: 6,
      filter: { "fields.slug[nin]": [post.slug] },
    }),
    manager.query({
      limit: 6,
      filter: { "fields.slug[in]": [data.recommendedPosts] },
    })
  ]);

  const origin = process.env.NEXT_PUBLIC_ORIGIN;
  if (!origin) {
    throw new Error("Missing NEXT_PUBLIC_ORIGIN");
  }
  
  const shareText = `${post.title} - ${data.siteName}`;
  const shareUrl = `${origin}/articles/${post.slug}`;

  const licenseInfo = new Map<string, string>([
    ["タイトル", post.title],
    ["著者", data.author],
    ["作成年", new Date(post.createdAt).getFullYear().toString()],
    ["URL", shareUrl],
    ["ライセンス", post.license],
  ] as [string, string][]);
  const licenseText = Array.from(licenseInfo.entries()).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  const shareFullText = `# ${post.title}\n\n ${post.content}\n\n---\n\n${licenseText}`;
  return (
    <main>
      { isEnabled && <PreviewWarning /> }
      <header className="space-y-5">
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <div className="space-x-2">
        {
          post.tags?.map((tag) => (
            <Link key={tag.sys.id} href={`/tags/${tag.sys.id}`}>
              <span className="badge badge-neutral link link-hover">
                # {tag.name}
              </span>
            </Link>
          ))
        }
        </div>
        <div className="text-sm flex flex-wrap">
          <div className="flex flex-row me-auto gap-3 items-center">
            <div className="tooltip" data-tip={data.donate}>
              <div className="avatar">
                <div className="ring-accent hover:ring-secondary ring-offset-base-100 w-10 rounded-full ring ring-offset-0">
                  <Link
                    href={data.donateURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={data.avatar}
                      alt="avatar icon"
                      width={96}
                      height={96}
                    />
                  </Link>
                </div>
              </div>
            </div>
            <span className="">{data.author}</span>
          </div>
          <div className="flex flex-row flex-wrap ms-auto gap-2 items-end">
            <span className="flex flex-row gap-1 tooltip" data-tip="Published">
              <MdAccessTime className="my-auto" />
              <time>{new Date(post.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
            </span>
            <span className="flex flex-row gap-1 tooltip" data-tip="Updated">
              <MdUpdate className="my-auto" />
              <time>{new Date(post.updatedAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
            </span>
            <span className="flex flex-row gap-1 tooltip" data-tip="Built">
              <FaScrewdriverWrench className="my-auto" />
              <time>
              {
                new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
                + " "
                + new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })
              }
              </time>
            </span>
          </div>
        </div>
      </header>
      <article className="my-12 sm:my-24">
        <ArticleBody content={post.content} showToc={post.showToc} />
      </article>
      <footer className="space-y-5">
        <Suspense fallback={<div>Loading...</div>}>
          <ListNavigator slug={slug} managerType="PostList" />
        </Suspense>
        <ShareButtons shareText={shareText} shareUrl={shareUrl} fullText={shareFullText} />
        <div className="border border-base-content border-dashed rounded p-3 space-y-2">
          <h6 className="font-bold">Credit</h6>
          <ul>
            <li>タイトル: {post.title}</li>
            <li>著者: {data.author}</li>
            <li>作成年: {new Date(post.createdAt).getFullYear()}</li>
          </ul>
          <h6 className="font-bold">License</h6>
          {post.license == null
            ? <p>ライセンスが不明です。</p>
            : <Markdown className="prose dark:!prose-invert break-words">{post.license}</Markdown>
          }
        </div>
        <div className="space-y-4">
        {
          data.showRelatedPosts && relatedPosts.length > 0 && <>
            <h2 className="text-2xl font-bold">関連記事</h2>
            <RelatedPosts posts={relatedPosts} />
          </>
        }
        {
          data.showNewPosts && newPosts.length > 0 && <>
            <h2 className="text-2xl font-bold">新着記事</h2>
            <RelatedPosts posts={newPosts} />
          </>
        }
        {
          recommendedPosts.length > 0 && <>
            <h2 className="text-2xl font-bold">おすすめ記事</h2>
            <RelatedPosts posts={recommendedPosts} />
          </>
        }        
        </div>
      </footer>
    </main>
  );
}
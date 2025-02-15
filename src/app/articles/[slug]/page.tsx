import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate } from "react-icons/md";
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

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const post = await new BlogPostManager().getBySlug(slug, isEnabled);
  if (!post) {
    notFound();
  }
  return {
    title: (isEnabled ? "(プレビュー)" : "") + post.title + " - " + data.siteName,
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

  return (
    <main>
      { isEnabled && <PreviewWarning /> }
      <header className="space-y-1">
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
        <div className="text-sm flex flex-wrap gap-2 justify-end">
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
        <hr />
      </header>
      <article className="my-16">
        <ArticleBody content={post.content} showToc={post.showToc} />
      </article>
      <footer className="space-y-3">
        <Suspense fallback={<div>Loading...</div>}>
          <ListNavigator slug={slug} managerType="PostList" />
        </Suspense>
        <ShareButtons shareText={shareText} shareUrl={shareUrl} />
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
        <hr />
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
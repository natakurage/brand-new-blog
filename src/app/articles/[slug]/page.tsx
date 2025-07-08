import { notFound } from "next/navigation";
import { BlogPost, BlogPostManager } from "@/lib/contentful";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import type { WithContext, BlogPosting } from "schema-dts";
import data from "@/app/data/data.json";
import { RelatedPosts } from "@/components/RelatedPosts";
import ListNavigator from "@/components/ListNavigator";
import ShareButtons from "@/components/ShareButtons";
import PreviewWarning from "@/components/PreviewWarning";
import ArticleBody from "@/components/ArticleBody";
import removeMd from "remove-markdown";
import HeaderTime from "@/components/HeaderTime";
import HeaderTags from "@/components/HeaderTags";
import HeaderAuthor from "@/components/HeaderAuthor";
import Credit from "@/components/Credit";
import Script from "next/script";

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
    title: (isEnabled ? "(プレビュー)" : "") + title,
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

function JsonLD({ post }: { post: BlogPost }) {
  const ogpImageUrl = new URL(`/og`, process.env.NEXT_PUBLIC_ORIGIN);
  ogpImageUrl.searchParams.set("title", post.title);
  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: removeMd(post.content).slice(0, 100),
    url: new URL(`/articles/${post.slug}`, process.env.NEXT_PUBLIC_ORIGIN).href,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    image: [ogpImageUrl.href],
    author: [
      {
        "@type": "Person",
        name: data.author,
        url: data.authorURL || undefined,
        image: data.avatar
      }
    ],
    license: post.license,
  };

  return (
    <Script
      id="json-ld"
      strategy="afterInteractive"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
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
    <>
      <JsonLD post={post} />
      <main>
        { isEnabled && <PreviewWarning /> }
        <header className="space-y-5">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <HeaderTags tags={post.tags || []} />
          <div className="text-sm flex flex-wrap">
            <HeaderAuthor author={data.author} avatar={data.avatar} donate={data.donate} donateURL={data.donateURL} className="me-auto" />
            <HeaderTime createdAt={post.createdAt} updatedAt={post.updatedAt} className="ms-auto" />
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
          <Credit
            title={post.title}
            author={data.author}
            year={new Date(post.createdAt).getFullYear()}
            license={post.license}
          />
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
    </>
  );
}
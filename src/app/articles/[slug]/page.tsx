import { cache } from "react";
import { notFound } from "next/navigation";
import { BlogPost } from "@/lib/models";
import { loadGlobalSettings } from "@/lib/cms";
import { BlogPostManager} from "@/lib/cms";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import type { WithContext, BlogPosting } from "schema-dts";
import { RelatedPosts } from "@/components/RelatedPosts";
import ListNavigator from "@/components/ListNavigator";
import ShareButtons from "@/components/ShareButtons";
import ArticleBody from "@/components/ArticleBody";
import removeMd from "remove-markdown";
import HeaderTime from "@/components/HeaderTime";
import HeaderTags from "@/components/HeaderTags";
import HeaderAuthor from "@/components/HeaderAuthor";
import Credit from "@/components/Credit";
import Script from "next/script";
import { ccDeedUrls } from "@/lib/licenses";

const getPost = cache((slug: string, isEnabled: boolean) => (
  new BlogPostManager().getBySlug(slug, isEnabled)
));

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const data = await loadGlobalSettings();
  const { isEnabled } = draftMode();
  const { slug } = params;
  const post = await getPost(slug, isEnabled);
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

export async function generateStaticParams() {
  const slugs = await new BlogPostManager().getAllSlugs();
  return slugs.map((slug) => ({ slug, key: undefined }));
}

async function JsonLD({ post }: { post: BlogPost }) {
  const data = await loadGlobalSettings();
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
        url: data.authorUrl || undefined,
        image: data.avatar
      }
    ],
    license: post.licenseSelect ? ccDeedUrls[post.licenseSelect] : post.license,
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
  const data = await loadGlobalSettings();
  const { isEnabled } = draftMode();
  const { slug } = params;
  const post = await getPost(slug, isEnabled);
  if (!post) {
    notFound();
  }

  const manager = new BlogPostManager();
  const [
    { items: relatedPosts },
    { items: newPosts },
    { items: recommendedPosts }
  ] = await Promise.all([
    manager.getRelatedPosts({
      slug: post.slug,
      tagSlugs: post.tags?.map((tag) => tag.slug),
    }),
    manager.getNewest({
      limit: 6,
      excludes: [post.slug],
    }),
    manager.getBySlugs(
      data.recommendedPosts,
      isEnabled,
      { limit: 6 }
    )
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
    ["ライセンス", post.license || "不明なライセンス"],
  ]);
  const licenseText = Array.from(licenseInfo.entries()).map(([key, value]) => `- ${key}: ${value}`).join("\n");
  const shareFullText = `# ${post.title}\n\n ${post.content}\n\n---\n\n${licenseText}`;
  return (
    <>
      <JsonLD post={post} />
      <main>
        <header className="space-y-5">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <HeaderTags tags={post.tags || []} />
          <div className="text-sm flex flex-wrap">
            <HeaderAuthor author={data.author} avatar={data.avatar} donate={data.donate} donateURL={data.donateUrl} className="me-auto" />
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
            url={shareUrl}
            year={new Date(post.createdAt).getFullYear()}
            licenseSelect={post.licenseSelect}
            workType="記事"
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
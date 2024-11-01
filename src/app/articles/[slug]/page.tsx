import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate, MdWarning } from "react-icons/md";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import Link from "next/link";
import { getPosts, getRelatedPosts } from "@/lib/contentful";
import remarkGfm from "remark-gfm";
import { FaBluesky, FaGetPocket, FaLine, FaXTwitter } from "react-icons/fa6";
import { draftMode, headers } from "next/headers";
import CopyButton from "@/components/CopyButton";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import DisablePreview from "@/components/DisablePreview";
import React from "react";
import EmbedCard from "@/components/EmbedCard";
import data from "@/app/data/data.json";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./style.css";
import { RelatedPosts } from "@/components/RelatedPosts";
import ListNavigator from "@/components/ListNavigator";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const { posts } = await getPosts({
    filter: { "fields.slug": slug },
    preview: isEnabled
  });
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];
  return {
    title: (isEnabled ? "(プレビュー)" : "") + post.title + " - " + data.siteName,
  };
}

async function LinkProcessor({ href, children }: { href: string, children: React.ReactNode }) {
  let url = null;
  try {
    url = new URL(href);
  } catch {
    return <a href={href}>{children}</a>;
  }
  if (url.searchParams.get("embed") != null) {
    let vid = "";
    if (url.hostname === "www.youtube.com") {
      vid = url.searchParams.get("v") || "";
      return <YouTubePlayer vid={vid} />;
    }
    if (url.hostname === "youtu.be") {
      vid = url.pathname.slice(1);
      return <YouTubePlayer vid={vid} />;
    }
  }
  return href && <EmbedCard url={href} />;
}

export default async function ArticlePage(
  { params,  searchParams}
  : { params: { slug: string }, searchParams: { listId?: string } }
) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const { listId } = searchParams;
  const { posts } = await getPosts({
    filter: { "fields.slug": slug },
    preview: isEnabled
  });
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];

  const { posts: relatedPosts } = await getRelatedPosts({
    slug: post.slug,
    tagIds: post.tags?.map((tag) => tag.sys.id),
  });
  const { posts: newPosts } = await getPosts({
    limit: 6,
    filter: { "fields.slug[nin]": [post.slug] },
  });
  const { posts: recommendedPosts } = await getPosts({
    limit: 6,
    filter: { "fields.slug[in]": [data.recommendedPosts] },
  });
  
  const shareText = `${post.title} - ${data.siteName}`;
  const headerList = headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") || "https";
  const shareUrl = `${protocol}://${host}/articles/${post.slug}`;

  const xShareURL = new URL("https://x.com/intent/post");
  xShareURL.searchParams.append("text", shareText);
  xShareURL.searchParams.append("url", shareUrl);

  const bskyShareURL = new URL("https://bsky.app/intent/compose");
  bskyShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);
  
  const pocketShareURL = new URL("https://getpocket.com/edit");
  pocketShareURL.searchParams.append("url", shareUrl);
  pocketShareURL.searchParams.append("title", shareText);

  const lineShareURL = new URL("https://line.me/R/msg/text");
  lineShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);
  
  return (
    <main>
      {
        isEnabled &&
        <div className="my-4 space-y-2">
          <div role="alert" className="alert alert-warning">
            <MdWarning size={24} />
            <span>
              このページはプレビューです！
              もし何らかの理由でこのページが見えてしまった場合、
              悪いことを考える前に
              <Link
                href={data.contactURL}
                className="link underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                こちら
              </Link>
              までお知らせください。
            </span>
          </div>
          <DisablePreview className="btn btn-ghost btn-sm" />
        </div>
      }
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
        <div className="text-sm flex gap-2 justify-end">
          <span className="flex flex-row gap-1">
            <MdAccessTime className="my-auto" />
            <time>{new Date(post.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
          </span>
          <span className="flex flex-row gap-1">
            <MdUpdate className="my-auto" />
            <time>{new Date(post.updatedAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
          </span>
        </div>
        <hr />
      </header>
      <article className="my-16">
        <Markdown
          className="prose dark:!prose-invert break-words"
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeSlug, rehypeKatex, [rehypeToc, {
            headings: ["h2", "h3"],
            customizeTOC: (toc: object) => {
              if (!post.showToc) return false;
              return {
                type: "element",
                tagName: "details",
                properties: { className: "collapse collapse-arrow bg-base-200" },
                children: [
                  {
                    type: "element",
                    tagName: "summary",
                    properties: { className: "collapse-title text-xl font-medium" },
                    children: [
                      { type: "text", value: "目次" },
                    ]
                  },
                  {
                    type: "element",
                    tagName: "div",
                    properties: { className: "collapse-content" },
                    children: [toc]
                  }
                ]
              };
            }
          }]]}
          components={{
            p: ({ children }) => {
              if (children == null) return null;
              // 単独の<a>を含む<p>の場合
              if (React.Children.count(children) === 1 && React.isValidElement(children) && children.type === "a") {
                const href = children.props.href;
                if (typeof href === "string") {
                  return <LinkProcessor href={href}>
                    {children.props.children}
                  </LinkProcessor>; 
                }
              }
              return <p>{children}</p>;
            }
          }}
        >
          {post.body}
        </Markdown>
      </article>
      <footer className="space-y-3">
        {
          listId && <ListNavigator current={slug} listId={listId} />
        }
        <div className="flex flex-wrap gap-2 justify-between">
          <Link
            href={xShareURL.toString()}
            aria-label="Share to Twitter"
            target="_blank"
            className="btn  bg-black text-white flex-1"
          >
            <FaXTwitter size={24} />
          </Link>
          <Link
            href={bskyShareURL.toString()}
            aria-label="Share to Bluesky"
            target="_blank"
            className="btn bg-[#0085FF] text-white flex-1"
          >
            <FaBluesky size={24} />
          </Link>
          <Link
            href={pocketShareURL.toString()}
            aria-label="Share to Pocket"
            target="_blank"
            className="btn bg-[#ED4956] text-white flex-1"
          >
            <FaGetPocket size={24} />
          </Link>
          <Link
            href={lineShareURL.toString()}
            aria-label="Share to LINE"
            target="_blank"
            className="btn bg-[#00B900] text-white flex-1"
          >
            <FaLine size={24} />
          </Link>
          <CopyButton
            text={shareUrl}
            className="btn btn-neutral text-white flex-1"
          />
        </div>
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
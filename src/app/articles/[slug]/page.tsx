import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate, MdWarning } from "react-icons/md";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import Link from "next/link";
import getPosts from "@/lib/contentful";
import remarkGfm from "remark-gfm";
import { FaBluesky, FaGetPocket, FaLine, FaXTwitter } from "react-icons/fa6";
import { draftMode, headers } from "next/headers";
import CopyButton from "@/components/CopyButton";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import DisablePreview from "@/components/DisablePreview";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const posts = await getPosts({
    content_type: "blogPost",
    "fields.slug": slug,
  }, isEnabled);
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];
  return {
    title: (isEnabled ? "(プレビュー)" : "") + post.title + " - ナタクラゲのブログ",
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { isEnabled } = draftMode();
  const { slug } = params;
  const posts = await getPosts({
    content_type: "blogPost",
    "fields.slug": slug,
  }, isEnabled);
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];
  
  const shareText = `${post.title} - ナタクラゲのブログ`;
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
    <div className="space-y-4">
      {
        isEnabled &&
        <>
          <div role="alert" className="alert alert-warning">
            <MdWarning size={24} />
            <span>
              このページはプレビューです！
              もし何らかの理由でこのページが見えてしまった場合、
              悪いことを考える前に
              <Link
                href="https://natakurage.vercel.app/contact"
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
        </>
      }
      <div className="space-y-1">
        <h1 className="text-5xl font-bold">{post.title}</h1>
        <div className="space-x-2">
        {
          post.tags?.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <span className="badge badge-neutral link link-hover">
                # {tag}
              </span>
            </Link>
          ))
        }
        </div>
        <div className="text-sm flex gap-2 justify-end">
          <span className="flex flex-row gap-1">
            <MdAccessTime className="my-auto" />
            <time>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</time>
          </span>
          <span className="flex flex-row gap-1">
            <MdUpdate className="my-auto" />
            <time>{new Date(post.updatedAt).toLocaleDateString("ja-JP")}</time>
          </span>
        </div>
        <hr />
      </div>
      <main>
        <Markdown
          className="prose"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, [rehypeToc, {
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
            a: ({ href, children }) => {
              // YouTubeリンクを検出
              if (!href) return undefined;
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
              return href &&
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </Link>;
            }
          }}
        >
          {post.body}
        </Markdown>
      </main>
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
      <div className="border border-neutral border-dashed rounded p-3 space-y-2">
        <h6 className="font-bold">Credit</h6>
        <ul>
          <li>タイトル: {post.title}</li>
          <li>著者: 千本槍みなも@ナタクラゲ</li>
          <li>作成年: {new Date(post.createdAt).getFullYear()}</li>
        </ul>
        <h6 className="font-bold">License</h6>
        {post.license == null
          ? <p>ライセンスが不明です。</p>
          : <Markdown className="text-sm prose">{post.license}</Markdown>
        }
      </div>
    </div>
  );
}
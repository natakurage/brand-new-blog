import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import Link from "next/link";
import getPosts from "@/lib/contentful";
import remarkGfm from "remark-gfm";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const posts = await getPosts({
    content_type: "blogPost",
    "fields.slug": slug,
  });
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];
  return {
    title: post.title + " - ナタクラゲのブログ",
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const posts = await getPosts({
    content_type: "blogPost",
    "fields.slug": slug,
  });
  if (posts.length === 0) {
    notFound();
  }
  const post = posts[0];
  return (
    <div className="space-y-4">
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
            <time>{new Date(post.createdAt).toLocaleDateString()}</time>
          </span>
          <span className="flex flex-row gap-1">
            <MdUpdate className="my-auto" />
            <time>{new Date(post.updatedAt).toLocaleDateString()}</time>
          </span>
        </div>
        <hr />
      </div>
      <main>
        <Markdown
          className="prose"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, [rehypeToc, { headings: ["h2", "h3"]} ]]}
        >
          {post.body}
        </Markdown>
      </main>
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
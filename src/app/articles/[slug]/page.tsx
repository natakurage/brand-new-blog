import client, { BlogPost } from "@/lib/contentful";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate } from "react-icons/md";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const entries = await client.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
  });
  if (entries.items.length === 0) {
    notFound();
  }
  return {
    title: entries.items[0].fields.title + " - Natakurage's Blog",
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const entries = await client.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
  });
  if (entries.items.length === 0) {
    notFound();
  }
  const { title, body, license } = entries.items[0].fields;
  const { createdAt, updatedAt } = entries.items[0].sys;
  const entry = {
    title,
    slug,
    body,
    createdAt,
    updatedAt,
    license
   } as BlogPost;
  console.log(entry);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-5xl font-bold">{entry.title}</h1>
        <div className="text-sm flex gap-4">
          <span className="flex flex-row gap-1">
            <MdAccessTime className="my-auto" />
            <time>{new Date(entry.createdAt).toLocaleDateString()}</time>
          </span>
          <span className="flex flex-row gap-1">
            <MdUpdate className="my-auto" />
            <time>{new Date(entry.updatedAt).toLocaleDateString()}</time>
          </span>
        </div>
      </div>
      <hr />
      <main>
        <Markdown
          className="prose"
          rehypePlugins={[rehypeSlug, [rehypeToc, { headings: ["h2", "h3"]} ]]}
        >
          {entry.body}
        </Markdown>
      </main>
      <div className="border border-neutral border-dashed rounded p-3 space-y-2">
        <h6 className="font-bold">Credit</h6>
        <ul>
          <li>タイトル: {entry.title}</li>
          <li>著者: 千本槍みなも@ナタクラゲ</li>
          <li>作成年: {new Date(entry.createdAt).getFullYear()}</li>
        </ul>
        <h6 className="font-bold">License</h6>
        {entry.license && (
          <p className="text-sm">
            <Markdown className="prose">{entry.license}</Markdown>
          </p>
        )}
      </div>
    </div>
  );
}
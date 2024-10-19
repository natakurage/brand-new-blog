import client, { BlogPost } from "@/lib/contentful";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { MdAccessTime, MdUpdate } from "react-icons/md";

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
  const { title, body } = entries.items[0].fields;
  const { createdAt, updatedAt } = entries.items[0].sys;
  const entry = {
    title,
    slug,
    body,
    createdAt,
    updatedAt
   } as BlogPost;
  console.log(entry);
  return (
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
      <hr />
      <main>
        <Markdown className="prose">{entry.body}</Markdown>
      </main>
    </div>
  );
}
import { BlogPost } from "@/lib/contentful";
import Link from "next/link";
import { MdUpdate } from "react-icons/md";

export default function ArticleList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="relative p-4 hover:bg-neutral hover:bg-opacity-50 rounded-lg overflow-hidden"
        >
          <h2 className="text-xl font-bold">
            {post.title}
          </h2>
          <p>{post.body.replace(/[#\[\]\(\)\n]/g, ' ').slice(0, 100)}...</p>
          <div className="space-x-2">
          {
            post.tags?.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="badge badge-neutral link link-hover relative z-10"
              >
                # {tag}
              </Link>
            ))
          }
          </div>
          <div className="flex flex-row gap-1 justify-end">
            <MdUpdate className="my-auto" />
            <time>{new Date(post.updatedAt).toLocaleDateString("ja-JP")}</time>
          </div>
          <Link href={`/articles/${post.slug}`} className="absolute w-full h-full top-0 left-0 z-1" />
        </li>
      ))}
    </ul>
  );
}
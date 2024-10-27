import { BlogPost } from "@/lib/contentful";
import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import Paginator from "./Pagenator";

export default function ArticleList(
  { posts, total, page, limit }:
  { posts: BlogPost[], total: number, page: number, limit: number }
) {
  const maxPages = Math.ceil(total / limit);
  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {posts.map((post) => (
          <li
            key={post.slug}
            className="relative p-4 btn-ghost rounded-lg break-words"
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
              <MdAccessTime className="my-auto" />
              <time>{new Date(post.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
            </div>
            <Link href={`/articles/${post.slug}`} className="absolute w-full h-full top-0 left-0 z-1" />
          </li>
        ))}
      </ul>
      <Paginator page={page} maxPages={maxPages} />
    </div>
  );
}
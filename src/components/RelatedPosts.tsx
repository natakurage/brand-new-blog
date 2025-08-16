import { BlogPost } from "@/lib/models";
import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import removeMd from "remove-markdown";
import TagList from "./TagList";

export async function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <li
          key={post.slug}
          className="card shadow-lg hover:shadow-xl card-compact rounded-lg break-words"
        >
          <article>
            <div className="card-body">
              <h2 className="card-title line-clamp-1 md:line-clamp-2">
                {post.title}
              </h2>
              <p className="line-clamp-3">
                {removeMd(post.content).slice(0, 100)}...
              </p>
              <TagList tags={post.tags ?? []} className="z-10" />
              <div className="flex flex-row gap-1 justify-end">
                <MdAccessTime className="my-auto" />
                <time dateTime={new Date(post.createdAt).toISOString()}>{new Date(post.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
              </div>
            </div>
            <Link href={`/articles/${post.slug}`} className="absolute w-full h-full top-0 left-0 z-1" />
          </article>
        </li>
      ))}
    </ul>
  );
}
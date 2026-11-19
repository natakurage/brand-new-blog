import type { ArticleSummary } from "@/lib/content/types";
import ListItem from "./ListItem";

export async function RelatedPosts({ posts }: { posts: ArticleSummary[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <ListItem
            item={post}
            showDate={true}
            showLength={true}
          />
        </li>
      ))}
    </ul>
  );
}
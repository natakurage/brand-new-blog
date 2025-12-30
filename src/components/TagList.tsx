import { Tag } from "@/lib/models";
import Link from "next/link";

export default function TagList({ tags, className }: { tags: Tag[], className?: string }) {
  return (
    <ul className={`flex gap-2 flex-wrap ${className} relative z-10`}>
    {
      tags.map((tag) => (
        <li key={tag.slug} className="inline">
          <Link href={`/tags/${tag.slug}`} className="badge badge-neutral link link-hover">
            # {tag.name}
          </Link>
        </li>
      ))
    }
    </ul>
  );
}
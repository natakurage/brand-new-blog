import { Tag } from "@/lib/models";
import Link from "next/link";

export default function HeaderTags({ tags }: { tags: Tag[] }) {
  return (
    <div className="space-x-2">
    {
      tags.map((tag) => (
        <Link key={tag.slug} href={`/tags/${tag.slug}`}>
          <span className="badge badge-neutral link link-hover">
            # {tag.name}
          </span>
        </Link>
      ))
    }
    </div>
  );
}

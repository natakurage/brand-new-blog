import { Tag } from "contentful";
import Link from "next/link";

export default function HeaderTags({ tags }: { tags: Tag[] }) {
  return (
    <div className="space-x-2">
    {
      tags.map((tag) => (
        <Link key={tag.sys.id} href={`/tags/${tag.sys.id}`}>
          <span className="badge badge-neutral link link-hover">
            # {tag.name}
          </span>
        </Link>
      ))
    }
    </div>
  );
}

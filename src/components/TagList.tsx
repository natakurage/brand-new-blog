import { hrefOf } from "@/lib/content/href";
import { Tag } from "@/lib/content/types";
import SiteLink from "./SiteLink";

export default function TagList({ tags, className }: { tags: Tag[], className?: string }) {
  return (
    <ul className={`flex gap-2 flex-wrap ${className} relative z-10`}>
    {
      tags.map((tag) => (
        <li key={tag.slug} className="inline">
          <SiteLink href={hrefOf(tag)} className="badge badge-neutral link link-hover">
            # {tag.name}
          </SiteLink>
        </li>
      ))
    }
    </ul>
  );
}
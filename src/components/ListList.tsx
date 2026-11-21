import type { CollectionSummary } from "@/lib/content/types";
import SiteLink from "./SiteLink";
import Paginator from "./Paginator";
import { hrefOf } from "@/lib/content/href";

interface ListListProps {
  lists: CollectionSummary[];
  total: number;
  page: number;
  limit: number;
  hrefFor: (page: number) => string;
}

export default function ListList(
  { hrefFor, lists, total, page, limit }: ListListProps
) {
  const maxPages = Math.ceil(total / limit);
  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {lists.map((list) => (
          <li
            key={list.slug}
            className="relative p-4 btn-ghost rounded-lg overflow-hidden"
          >
            <article>
              <h2 className="text-xl font-bold">
                {list.title}
              </h2>
              {list.description && <p>{list.description.replace(/[#\[\]\(\)\n]/g, ' ').slice(0, 100)}...</p>}
              <SiteLink href={hrefOf(list)} className="absolute w-full h-full top-0 left-0 z-1" />
            </article>
          </li>
        ))}
      </ul>
      <Paginator
        hrefFor={hrefFor}
        page={page}
        maxPages={maxPages}
      />
    </div>
  );
}
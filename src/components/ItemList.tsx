import { BlogItem } from "@/lib/contentful";
import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import Paginator from "./Paginator";
import removeMd from "remove-markdown";

export default function ItemList(
  { items, total, page, limit, suffix }:
  { items: (BlogItem | null)[], total: number, page: number, limit: number, suffix?: string }
) {
  const maxPages = Math.ceil(total / limit);
  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {items.map((item) => (item &&
          <li
            key={item.slug}
            className="relative p-4 btn-ghost rounded-lg break-words"
          >
            <h2 className="text-xl font-bold">
              {item.title}
            </h2>
            <p>{removeMd(item.content).slice(0, 100)}...</p>
            <div className="space-x-2">
            {
              item.tags?.map((tag) => (
                <Link
                  key={tag.sys.id}
                  href={`/tags/${tag.sys.id}`}
                  className="badge badge-neutral link link-hover relative z-10"
                >
                  # {tag.name}
                </Link>
              ))
            }
            </div>
            <div className="flex flex-row gap-1 justify-end">
              <MdAccessTime className="my-auto" />
              <time>{new Date(item.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
            </div>
            <Link href={`/${item.typeUrl}/${item.slug}` + (suffix ? suffix : '')} className="absolute w-full h-full top-0 left-0 z-1" />
          </li>
        ))}
      </ul>
      <Paginator page={page} maxPages={maxPages} />
    </div>
  );
}
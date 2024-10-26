import { PostList } from "@/lib/contentful";
import Link from "next/link";
import Paginator from "./Pagenator";

export default function ListList(
  { lists, total, page, limit }:
  { lists: PostList[], total: number, page: number, limit: number }
) {
  const maxPages = Math.ceil(total / limit);
  return (
    <div>
      <ul className="space-y-4">
        {lists.map((list) => (
          <li
            key={list.id}
            className="relative p-4 btn-ghost rounded-lg overflow-hidden"
          >
            <h2 className="text-xl font-bold">
              {list.title}
            </h2>
            <p>{list.description.replace(/[#\[\]\(\)\n]/g, ' ').slice(0, 100)}...</p>
            <Link href={`/lists/${list.id}`} className="absolute w-full h-full top-0 left-0 z-1" />
          </li>
        ))}
      </ul>
      <Paginator page={page} maxPages={maxPages} />
    </div>
  );
}
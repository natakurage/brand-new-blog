import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { MdRssFeed } from "react-icons/md";
import { LinkItem } from "@/lib/models";

export default function SideBar({ pages }: { pages?: LinkItem[] }) {
  return (
    <aside className="hidden md:block max-w-72">
      <ul className="menu p-3 overflow-y-auto w-full bg-base-100 text-base-content bg-opacity-100">
      {
          pages?.map(({ name, href }) => (
            <li key={name}>
              <Link href={href} >{name}</Link>
            </li>
          ))
        }
        <li><SearchBar /></li>
        <li className="flex flex-row">
          <Link href="/rss">
            <MdRssFeed size={24} />
          </Link>
        </li>
      </ul>
    </aside>
  );
}
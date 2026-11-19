import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import TagList from "./TagList";
import { FaRegHourglass, FaRulerHorizontal } from "react-icons/fa6";
import { BlogItem } from "@/lib/content/types";
import { summarize } from "@/lib/content/summary";

export default function ListItem({ item, suffix, showLength = true, showDate = true }: { item: BlogItem; suffix?: string; showLength?: boolean; showDate?: boolean }) {
  const { excerpt, length, readingMinutes } = summarize(item.content);
  return (
    <article className="relative p-4 shadow-lg hover:bg-base-content/20 hover:shadow-xl rounded-lg wrap-break-word">
      <h2 className="text-xl font-bold">
        {item.title}
      </h2>
      <p>{excerpt}</p>
      <TagList tags={item.tags} />
      <div className="flex flex-row gap-4 mt-2 justify-end text-sm text-base-content/70">
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRulerHorizontal className="my-auto" />
          {length}文字
        </div>
      }
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRegHourglass className="my-auto" />
          {readingMinutes}分
        </div>
      }
      {
        showDate && <div className="flex flex-row gap-1">
          <MdAccessTime className="my-auto" />
          <time dateTime={item.createdAt.toISOString()}>{item.createdAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </div>
      }
      </div>
      <Link href={`/${item.typeUrl}/${item.slug}` + (suffix ? suffix : '')} className="absolute w-full h-full top-0 left-0 z-1" />
    </article>
  );
}
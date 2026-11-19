import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import TagList from "./TagList";
import { FaRegHourglass, FaRulerHorizontal } from "react-icons/fa6";
import type { ItemSummary } from "@/lib/content/types";
import { hrefOf } from "@/lib/content/href";
import { CALENDAR } from "@/lib/config";

export default function ListItem({ item, suffix, showLength = true, showDate = true }: { item: ItemSummary; suffix?: string; showLength?: boolean; showDate?: boolean }) {
  return (
    <article className="relative p-4 shadow-lg hover:bg-base-content/20 hover:shadow-xl rounded-lg wrap-break-word">
      <h2 className="text-xl font-bold">
        {item.title}
      </h2>
      <p>{item.excerpt}</p>
      <TagList tags={item.tags} />
      <div className="flex flex-row gap-4 mt-2 justify-end text-sm text-base-content/70">
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRulerHorizontal className="my-auto" />
          {item.length}文字
        </div>
      }
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRegHourglass className="my-auto" />
          {item.readingMinutes}分
        </div>
      }
      {
        showDate && <div className="flex flex-row gap-1">
          <MdAccessTime className="my-auto" />
          <time dateTime={item.createdAt.toISOString()}>{CALENDAR.date(item.createdAt)}</time>
        </div>
      }
      </div>
      <Link href={hrefOf(item) + (suffix ? suffix : '')} className="absolute w-full h-full top-0 left-0 z-1" />
    </article>
  );
}
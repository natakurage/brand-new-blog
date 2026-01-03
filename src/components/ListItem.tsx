import Link from "next/link";
import { MdAccessTime } from "react-icons/md";
import removeMd from "remove-markdown";
import TagList from "./TagList";
import { FaRegHourglass, FaRulerHorizontal } from "react-icons/fa6";
import { BlogItem } from "@/lib/models";
import { constants } from "@/lib/cmsUtils";

export default function ListItem({ item, suffix, showLength = true, showDate = true }: { item: BlogItem; suffix?: string; showLength?: boolean; showDate?: boolean }) {
  return (
    <article className="relative p-4 btn-ghost shadow-lg hover:shadow-xl rounded-lg wrap-break-word">
      <h2 className="text-xl font-bold">
        {item.title}
      </h2>
      <p>{removeMd(item.content).slice(0, 100)}...</p>
      <TagList tags={item.tags ?? []} />
      <div className="flex flex-row gap-4 mt-2 justify-end text-sm text-base-content/70">
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRulerHorizontal className="my-auto" />
          {removeMd(item.content).length}文字
        </div>
      }
      {
        showLength && <div className="flex flex-row gap-1">
          <FaRegHourglass className="my-auto" />
          {Math.ceil(removeMd(item.content).length / constants.lettersPerMinute)}分
        </div>
      }
      {
        showDate && <div className="flex flex-row gap-1">
          <MdAccessTime className="my-auto" />
          <time dateTime={new Date(item.createdAt).toISOString()}>{new Date(item.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </div>
      }
      </div>
      <Link href={`/${item.typeUrl}/${item.slug}` + (suffix ? suffix : '')} className="absolute w-full h-full top-0 left-0 z-1" />
    </article>
  );
}
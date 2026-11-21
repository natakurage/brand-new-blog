import SiteLink from "./SiteLink";
import { MdAccessTime } from "react-icons/md";
import TagList from "./TagList";
import { FaRegHourglass, FaRulerHorizontal } from "react-icons/fa6";
import { hasDigest, isWork, type ContentKind, type ContentSummary } from "@/lib/content/types";
import { hrefIn, hrefOf, type Addressable } from "@/lib/content/href";
import { CALENDAR } from "@/lib/config";

const kindLabels: Record<ContentKind, string> = {
  article: "記事",
  song: "曲",
  postList: "リスト",
  album: "アルバム",
};

export default function ListItem(
  { item, context, showLength = true, showDate = true, showKind = false }:
  { item: ContentSummary; context?: Addressable; showLength?: boolean; showDate?: boolean; showKind?: boolean }
) {
  const digest = hasDigest(item) ? item : undefined;
  const createdAt = isWork(item) ? item.createdAt : undefined;
  return (
    <article className="relative p-4 shadow-lg hover:bg-base-content/20 hover:shadow-xl rounded-lg wrap-break-word">
      {showKind && <span className="badge badge-sm badge-outline mb-1">{kindLabels[item.kind]}</span>}
      <h2 className="text-xl font-bold">
        {item.title}
      </h2>
      <p>{digest ? digest.excerpt : item.description}</p>
      <TagList tags={item.tags} />
      <div className="flex flex-row gap-4 mt-2 justify-end text-sm text-base-content/70">
      {
        showLength && digest && <div className="flex flex-row gap-1">
          <FaRulerHorizontal className="my-auto" />
          {digest.length}文字
        </div>
      }
      {
        showLength && digest && <div className="flex flex-row gap-1">
          <FaRegHourglass className="my-auto" />
          {digest.readingMinutes}分
        </div>
      }
      {
        showDate && createdAt && <div className="flex flex-row gap-1">
          <MdAccessTime className="my-auto" />
          <time dateTime={createdAt.toISOString()}>{CALENDAR.date(createdAt)}</time>
        </div>
      }
      </div>
      <SiteLink href={context ? hrefIn(item, context) : hrefOf(item)} className="absolute w-full h-full top-0 left-0 z-1" />
    </article>
  );
}

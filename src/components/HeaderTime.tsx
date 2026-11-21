import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaRegHourglass, FaRulerHorizontal, FaScrewdriverWrench } from "react-icons/fa6";
import { cacheLife, cacheTag } from "next/cache";
import { CALENDAR } from "@/lib/config";
import type { Addressable } from "@/lib/content/href";
import { documentTag } from "@/lib/content/cacheTags";

interface HeaderTimeProps {
  item: Addressable;
  createdAt?: Date;
  updatedAt?: Date;
  length: number;
  readingMinutes: number;
  className?: string;
}

// 文書と同じタグで作り直されるので、ページの内容が作られた時刻になる
async function BuiltAt({ item }: { item: Addressable }) {
  "use cache";
  cacheLife("days");
  cacheTag(documentTag(item));
  const builtAt = new Date();
  return (
    <span className="flex flex-row gap-1 tooltip" data-tip="Built">
      <FaScrewdriverWrench className="my-auto" />
      <time dateTime={builtAt.toISOString()}>
        {CALENDAR.dateTime(builtAt)}
      </time>
    </span>
  );
}

export default function HeaderTime({ item, createdAt, updatedAt, length, readingMinutes, className }: HeaderTimeProps) {
  return (
      <div className={`text-base-content/70 space-y-2 ${className}`}>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Length">
          <FaRulerHorizontal className="my-auto" />
          {length}文字
        </span>
      }
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Reading Time">
          <FaRegHourglass className="my-auto" />
          {readingMinutes}分で読めます
        </span>
      }
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Published">
          <MdAccessTime className="my-auto" />
          <time dateTime={createdAt.toISOString()}>{CALENDAR.date(createdAt)}</time>
        </span>
      }
      {
        updatedAt && <span className="flex flex-row gap-1 tooltip" data-tip="Updated">
          <MdUpdate className="my-auto" />
          <time dateTime={updatedAt.toISOString()}>{CALENDAR.date(updatedAt)}</time>
        </span>
      }
        <BuiltAt item={{ kind: item.kind, slug: item.slug }} />
      </div>
    </div>
  );
}
import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaRegHourglass, FaRulerHorizontal, FaScrewdriverWrench } from "react-icons/fa6";
import { CALENDAR } from "@/lib/config";

interface HeaderTimeProps {
  createdAt?: Date;
  updatedAt?: Date;
  length: number;
  readingMinutes: number;
  className?: string;
}

export default function HeaderTime({ createdAt, updatedAt, length, readingMinutes, className }: HeaderTimeProps) {
  const builtAtDate = new Date();

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
        <span className="flex flex-row gap-1 tooltip" data-tip="Built">
          <FaScrewdriverWrench className="my-auto" />
          <time dateTime={builtAtDate.toISOString()}>
          {CALENDAR.dateTime(builtAtDate)}
          </time>
        </span>
      </div>
    </div>
  );
}
import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaRegHourglass, FaRulerHorizontal, FaScrewdriverWrench } from "react-icons/fa6";
import type { Summary } from "@/lib/content/summary";

interface HeaderTimeProps {
  createdAt?: Date;
  updatedAt?: Date;
  summary: Pick<Summary, "length" | "readingMinutes">;
  className?: string;
}

export default function HeaderTime({ createdAt, updatedAt, summary, className }: HeaderTimeProps) {
  const builtAtDate = new Date();

  return (
      <div className={`text-base-content/70 space-y-2 ${className}`}>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Length">
          <FaRulerHorizontal className="my-auto" />
          {summary.length}文字
        </span>
      }
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Reading Time">
          <FaRegHourglass className="my-auto" />
          {summary.readingMinutes}分で読めます
        </span>
      }
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Published">
          <MdAccessTime className="my-auto" />
          <time dateTime={createdAt.toISOString()}>{createdAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </span>
      }
      {
        updatedAt && <span className="flex flex-row gap-1 tooltip" data-tip="Updated">
          <MdUpdate className="my-auto" />
          <time dateTime={updatedAt.toISOString()}>{updatedAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </span>
      }
        <span className="flex flex-row gap-1 tooltip" data-tip="Built">
          <FaScrewdriverWrench className="my-auto" />
          <time dateTime={builtAtDate.toISOString()}>
          {
            builtAtDate.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
            + " "
            + builtAtDate.toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })
          }
          </time>
        </span>
      </div>
    </div>
  );
}
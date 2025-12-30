import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaRegHourglass, FaRulerHorizontal, FaScrewdriverWrench } from "react-icons/fa6";
import { constants } from "@/lib/cmsUtils";

export default function HeaderTime({ createdAt, updatedAt, length, className }: { createdAt?: string; updatedAt?: string; length?: number; className?: string }) {
  const createdAtDate = createdAt ? new Date(createdAt) : undefined;
  const updatedAtDate = updatedAt ? new Date(updatedAt) : undefined;
  const builtAtDate = new Date();
  const readingTimeMinutes = length ? Math.ceil(length / constants.lettersPerMinute) : null;
  return (
      <div className={`text-base-content/70 space-y-2 ${className}`}>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAtDate && <span className="flex flex-row gap-1 tooltip" data-tip="Length">
          <FaRulerHorizontal className="my-auto" />
          {length}文字
        </span>
      }
      {
        createdAtDate && <span className="flex flex-row gap-1 tooltip" data-tip="Reading Time">
          <FaRegHourglass className="my-auto" />
          {readingTimeMinutes}分で読めます
        </span>
      }
      </div>
      <div className="flex flex-row flex-wrap gap-2 justify-end">
      {
        createdAtDate && <span className="flex flex-row gap-1 tooltip" data-tip="Published">
          <MdAccessTime className="my-auto" />
          <time dateTime={createdAtDate?.toISOString()}>{createdAtDate.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </span>
      }
      {
        updatedAtDate && <span className="flex flex-row gap-1 tooltip" data-tip="Updated">
          <MdUpdate className="my-auto" />
          <time dateTime={updatedAtDate?.toISOString()}>{updatedAtDate.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
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
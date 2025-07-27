import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaScrewdriverWrench } from "react-icons/fa6";

export default function HeaderTime({ createdAt, updatedAt, className }: { createdAt?: string; updatedAt?: string; className?: string }) {
  const createdAtDate = createdAt ? new Date(createdAt) : undefined;
  const updatedAtDate = updatedAt ? new Date(updatedAt) : undefined;
  const builtAtDate = new Date();
  return (
    <div className={`flex flex-row flex-wrap gap-2 items-end ${className}`}>
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
  );
}
import { MdAccessTime } from "react-icons/md";
import { MdUpdate } from "react-icons/md";
import { FaScrewdriverWrench } from "react-icons/fa6";

export default function HeaderTime({ createdAt, updatedAt, className }: { createdAt?: string; updatedAt?: string; className?: string }) {
  return (
    <div className={`flex flex-row flex-wrap gap-2 items-end ${className}`}>
      {
        createdAt && <span className="flex flex-row gap-1 tooltip" data-tip="Published">
          <MdAccessTime className="my-auto" />
          <time>{new Date(createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </span>
      }
      {
        updatedAt && <span className="flex flex-row gap-1 tooltip" data-tip="Updated">
          <MdUpdate className="my-auto" />
          <time>{new Date(updatedAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</time>
        </span>
      }
      <span className="flex flex-row gap-1 tooltip" data-tip="Built">
        <FaScrewdriverWrench className="my-auto" />
        <time>
        {
          new Date().toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
          + " "
          + new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })
        }
        </time>
      </span>
    </div>
  );
}
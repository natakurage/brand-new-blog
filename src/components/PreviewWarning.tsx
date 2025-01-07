
import DisablePreview from "@/components/DisablePreview";
import Link from "next/link";
import { MdWarning } from "react-icons/md";
import data from "@/app/data/data.json";

export default function PreviewWarning() {
  return (
    <div className="my-4 space-y-2">
      <div role="alert" className="alert alert-warning">
        <MdWarning size={24} />
        <span>
          このページはプレビューです！
          もし何らかの理由でこのページが見えてしまった場合、
          悪いことを考える前に
          <Link
            href={data.contactURL}
            className="link underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            こちら
          </Link>
          までお知らせください。
        </span>
      </div>
      <DisablePreview className="btn btn-ghost btn-sm" />
    </div>
  );
}
import DisablePreview from "@/components/DisablePreview";
import { loadGlobalSettings } from "@/lib/globalSettings";
import Link from "next/link";
import { MdWarning } from "react-icons/md";

export default async function PreviewWarning() {
  const data = await loadGlobalSettings();
  return (
    <div className="my-4 space-y-2">
      <div role="alert" className="alert alert-warning">
        <MdWarning size={24} />
        <span>
          このページはプレビューです！
          {
            data.contactUrl && <>
              もし何らかの理由でこのページが見えてしまった場合、
              悪いことを考える前に
              <Link
                href={data.contactUrl}
                className="link underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                こちら
              </Link>
              までお知らせください。
            </>
          }

        </span>
      </div>
      <DisablePreview className="btn btn-ghost btn-sm" />
    </div>
  );
}
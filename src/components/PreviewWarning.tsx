import { repositories } from "@/lib/repositories";
import Link from "next/link";
import { MdWarning } from "react-icons/md";
import { draftMode } from "next/headers";

// Cookie を変えた Server Action の後は、今のページが描き直される
async function disablePreview() {
  "use server";
  (await draftMode()).disable();
}

export default async function PreviewWarning() {
  const data = await repositories.siteSettings.get();
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
      <form action={disablePreview}>
        <button type="submit" className="btn btn-ghost btn-sm">
          プレビューを無効にする
        </button>
      </form>
    </div>
  );
}
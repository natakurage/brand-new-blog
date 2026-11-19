import Markdown from "react-markdown";
import type { CcLicenseId, License } from "@/lib/content/license";
import { ccLicenses } from "@/lib/content/license";
import Link from "next/link";
import Image from "next/image";
import CopyLicenseButton from "./CopyLicenseButton";

interface CreditProps {
  workType?: string;
  title: string;
  author?: string;
  artists?: string[];
  additionalInfo?: string[];
  url: string;
  year: number;
  license: License;
}

interface CCLicenseNoticeProps {
  workType?: string;
  title: string;
  creator?: string;
  url: string;
  year: number;
  id: CcLicenseId;
}

type LicenseNoticeProps = Omit<CCLicenseNoticeProps, "id"> & {
  license: License;
};

function CCLicenseNotice({ workType, title, creator, url, year, id }: CCLicenseNoticeProps) {
  return (
    <p>
      <Image
        src={ccLicenses[id].logoUrl}
        alt={`${id} logo`}
        width={88}
        height={31}
        className="inline me-2 align-middle"
      />
      この{workType}は
      <Link
        href={ccLicenses[id].deedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-base-content"
      >
        {id}
      </Link>
      ライセンスのもとで提供されています。
      <CopyLicenseButton
        workType={workType || "作品"}
        title={title}
        creator={creator || "不明"}
        year={year}
        url={url}
        id={id}
        className="inline ms-2 align-sub"
      />
    </p>
  );
}

function LicenseNotice({ license, ...rest }: LicenseNoticeProps) {
  switch (license.kind) {
    case "cc":
      return (
        <CCLicenseNotice {...rest} id={license.id}/>
      );
    case "custom":
      return (
        <div className="prose dark:prose-invert! wrap-break-word">
          <Markdown>{license.text}</Markdown>
        </div>
      );
    case "unspecified":
      return <p>ライセンスが不明です。</p>;
    default:
      return license satisfies never;
  }
}

export default function Credit({ workType, title, author, artists, additionalInfo, url, year, license }: CreditProps) {
  const creator = author || artists?.join(", ");
  return (
    <section className="border border-base-content border-dashed rounded p-3 space-y-2">
      <h6 className="font-bold">Credit</h6>
      <ul>
        <li>タイトル: {title}</li>
        { author && <li>著者: {author}</li> }
        { artists && artists.length > 0 && <li>アーティスト: {artists.join(", ")}</li> }
        { additionalInfo && additionalInfo.length > 0 && additionalInfo.map((info, index) => (
          <li key={index}>{info}</li>
        )) }
        <li>作成年: {year}</li>
      </ul>
      <h6 className="font-bold">URL</h6>
      <p><Link href={url} className="text-primary">{url}</Link></p>
      <h6 className="font-bold">License</h6>
      <LicenseNotice
        workType={workType}
        title={title}
        creator={creator}
        url={url}
        year={year}
        license={license}
      />
    </section>
  );
}

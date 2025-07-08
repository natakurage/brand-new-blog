import Markdown from "react-markdown";
import type { LicenseType } from "@/lib/licenses";
import { ccDeedUrls, ccLogos } from "@/lib/licenses";
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
  licenseSelect?: LicenseType;
  license?: string;
}

function CCLicenseNotice({ workType, title, author, artists, url, year, licenseSelect }: CreditProps) {
  return (
    <p>
      <Image
        src={ccLogos[licenseSelect!]}
        alt={`${licenseSelect} logo`}
        width={88}
        height={31}
        className="inline me-2 align-middle"
      />
      この{workType}は
      <Link
        href={ccDeedUrls[licenseSelect!]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-base-content"
      >
        {licenseSelect}
      </Link>
      ライセンスのもとで提供されています。
      <CopyLicenseButton
        workType={workType || "作品"}
        title={title}
        creator={author || artists?.join(", ") || "不明"}
        year={year}
        url={url}
        licenseSelect={licenseSelect!}
        className="inline ms-2 align-sub"
      />
    </p>
  );
}

export default function Credit({ workType, title, author, artists, url, year, license, additionalInfo, licenseSelect }: CreditProps) {
  return (
    <div className="border border-base-content border-dashed rounded p-3 space-y-2">
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
      {
        licenseSelect
        ? <CCLicenseNotice
            workType={workType}
            title={title}
            author={author || artists?.join(", ")}
            url={url}
            year={year}
            license={license}
            additionalInfo={additionalInfo}
            licenseSelect={licenseSelect!}
          />
        : license
          ? <Markdown className="prose dark:!prose-invert break-words">{license}</Markdown>
          : <p>ライセンスが不明です。</p>
      }
    </div>
  );
}

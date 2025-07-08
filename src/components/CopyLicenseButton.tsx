"use client";

import { LicenseType, ccDeedUrls } from "@/lib/licenses";
import { useState } from "react";
import { MdContentCopy } from "react-icons/md";

interface LicenseInfo {
  workType: string;
  title: string;
  creator: string;
  year: number;
  url?: string;
  licenseSelect: LicenseType;
}

export default function CopyLicenseButton({
  workType,
  title,
  creator,
  year,
  url,
  licenseSelect,
  className
}: LicenseInfo & { className?: string }
) {
  const [copied, setCopied] = useState(false);

  const modifiedTitle = title.replace(/「(.*?)」/g, '『$1』');
  const textToCopy = `${creator}による${workType}「${modifiedTitle}」(${year})は、${licenseSelect} (${ccDeedUrls[licenseSelect!]})のもとで提供されています。${url}`;

  const handleClick = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
    {
      copied && <div className="toast toast-bottom toast-end z-50 max-w-sm text-wrap">
        <div className="alert alert-success">
          <span className="font-bold">ライセンス情報をコピーしました！</span>
        </div>
      </div>
    }
      <button
        aria-label="Copy text"
        className={className}
        onClick={handleClick}
      >
        <MdContentCopy size={24} />
      </button>
    </>
  );
}
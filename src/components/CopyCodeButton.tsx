"use client";

import { useState } from "react";
import { MdContentCopy } from "react-icons/md";

export default function CopyCodeButton({
  code,
  className
}: { code: string, className?: string }
) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
    {
      copied && <div className="toast toast-bottom toast-end z-50 max-w-sm text-wrap">
        <div className="alert alert-success">
          <span className="font-bold">コピーしました！</span>
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
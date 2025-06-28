"use client";

import { useState } from "react";
import { MdContentCopy } from "react-icons/md";

type CopyMessageType = "URLをコピーしました!" | "全文をコピーしました!（Shift+クリックでURLをコピー）"

export default function CopyButton({ url, fullText, className }: { url: string, fullText?: string, className?: string }) {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState<CopyMessageType | null>();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isFullText = !e.shiftKey && fullText != null;
    const textToCopy = isFullText ? fullText: url;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setCopyMessage(isFullText ? "全文をコピーしました!（Shift+クリックでURLをコピー）" : "URLをコピーしました!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
    {
      copied && <div className="toast toast-bottom toast-end z-50 max-w-sm text-wrap">
        <div className="alert alert-success">
          <span className="font-bold">{copyMessage}</span>
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
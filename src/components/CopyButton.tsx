"use client";

import { useState, useRef } from "react";
import { MdContentCopy } from "react-icons/md";

type CopyMessageType = "URLをコピーしました!" | "全文をコピーしました!";

export default function CopyButton({ url, fullText, className }: { url: string, fullText?: string, className?: string }) {
  const popoverRef = useRef<HTMLUListElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState<CopyMessageType | null>();

  const handleClick = (isFullText: boolean) => {
    const textToCopy = (isFullText && fullText) ? fullText: url;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    closePopover();
    setCopyMessage(isFullText ? "全文をコピーしました!" : "URLをコピーしました!");
    setTimeout(() => setCopied(false), 3000);
  };

  const closePopover = () => {
    if (popoverRef.current) {
      popoverRef.current.hidePopover();
    }
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
        popoverTarget="copy-popover"
        className={className}
        style={{ anchorName: "--anchor-1"}}
      >
        <MdContentCopy size={24} />
      </button>
      <ul
        ref={popoverRef}
        id="copy-popover"
        popover="auto"
        style={{ positionAnchor: "--anchor-1" }}
        className="dropdown dropdown-end menu p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <button onClick={() => handleClick(false)}>
            URLをコピー
          </button>
        </li>
        {
          fullText !== undefined && (
            <li>
              <button onClick={() => handleClick(true)}>
                全文をコピー
              </button>
            </li>
          )
        }
      </ul>
    </>
  );
}
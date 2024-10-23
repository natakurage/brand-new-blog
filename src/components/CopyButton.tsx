"use client";

import { useState } from "react";
import { MdContentCopy } from "react-icons/md";

export default function CopyButton({ text, className }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
    {
      copied && <div className="toast toast-bottom toast-end">
        <div className="alert alert-success">
          <span className="font-bold">Copied!</span>
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
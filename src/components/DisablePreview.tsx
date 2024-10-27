"use client";

import { useRouter } from "nextjs-toploader/app";

export default function DisablePreview({ className }: { className: string }) {
  const router = useRouter();

  return (
    <button
      className={className}
      onClick={async () => {
        const { status } = await fetch("/api/disable-preview");
        if (status === 200) {
          router.refresh();
        }
      }}
    >
      プレビューを無効にする
    </button>
  );
}
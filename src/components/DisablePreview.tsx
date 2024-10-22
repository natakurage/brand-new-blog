"use client";

export default function DisablePreview({ className }: { className: string }) {
  return (
    <button
      className={className}
      onClick={async () => {
        const { status } = await fetch("/api/disable-preview");
        if (status === 200) {
          window.location.reload();
        }
      }}
    >
      プレビューを無効にする
    </button>
  );
}
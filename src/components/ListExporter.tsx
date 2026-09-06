"use client";

import { useRef, useState } from "react";
import { BlogItem } from "@/lib/models";
import { MdClose, MdContentCopy } from "react-icons/md";
import { PiExport } from "react-icons/pi";
import useTimeout from "@/app/hooks/useTimeout";

const formats = {
  normal: "通常",
  txt: "プレーンテキスト(.txt)",
  md: "Markdown(.md)",
} as const;

const separators = {
  newline: "改行(\\n)",
  comma: "カンマ(,)",
  space: "スペース(\" \")",
} as const;

const separatorValues = {
  comma: ",",
  newline: "\n",
  space: " ",
} as const;

type Format = keyof typeof formats;
type Separator = keyof typeof separators;

export default function ListExporter({ origin, items, suffix }: { origin: string; items: BlogItem[]; suffix?: string }) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [format, setFormat] = useState<Format>("normal");
  const [separator, setSeparator] = useState<Separator>("newline");
  const [copied, setCopied] = useState(false);
  const { set: setButtonDisappear } = useTimeout(() => {
    setCopied(false);
  }, 3000);

  const exportedContent = () => {
    const separatorValue = separatorValues[separator];
    const formatExtension = format === "normal" ? "" : `.${format}`;
    const urls = items.map((item) => `${origin}/${item.typeUrl}/${item.slug}` + (suffix ? suffix : '') + formatExtension);
    const content = urls.join(separatorValue);

    return content;
  };

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(exportedContent());
    setCopied(true);
    setButtonDisappear();
  };

  return (
    <>
      {
        copied && <div className="toast toast-bottom toast-end z-50 max-w-sm text-wrap">
          <div className="alert alert-success">
            <span className="font-bold">URLをコピーしました!</span>
          </div>
        </div>
      }
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <MdClose size={24} />
            </button>
          </form>
          <form className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold mb-4">URL一覧をエクスポート</h2>
            <h3 className="font-bold">記事のフォーマット</h3>
            <div className="flex flex-wrap gap-2">
              {
                (["normal", "txt", "md"] as const).map((f) => (
                  <label className="w-full flex items-center gap-2" key={formats[f]}>
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                    />
                    {formats[f]}
                  </label>
                ))
              }
              </div>
            <h3 className="font-bold mt-4">区切り文字</h3>
              <div className="flex flex-wrap gap-2">
              {
                (["newline", "comma", "space"] as const).map((s) => (
                  <label className="w-full flex items-center gap-2" key={separators[s]}>
                    <input
                      type="radio"
                      name="separator"
                      value={s}
                      checked={separator === s}
                      onChange={() => setSeparator(s)}
                    />
                    {separators[s]}
                  </label>
                ))
              }
            </div>
          </form>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">エクスポートされたURL</h3>
              <button
                className="btn btn-sm btn-ghost btn-circle"
                onClick={(e) => handleCopy(e)}
              >
                <MdContentCopy size={20} className="inline mr-2" />
              </button>
            </div>
            <textarea
              className="w-full h-40 p-2 border rounded"
              value={exportedContent()}
              readOnly
            />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>閉じる</button>
        </form>
      </dialog>
      <button
        className="btn btn-neutral"
        onClick={() => modalRef.current?.showModal()}
      >
        <PiExport size={20} />
        URLをエクスポート
      </button>
    </>
  );
};
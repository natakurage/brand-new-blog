"use client";

import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const adBlockerMessages = {
  ja: {
    title: "広告ブロッカーを検出しました！",
    messages: [
      "このサイトでは、広告ブロッカーの使用は特に問題ありません。",
      "広告ブロッカーを無効にするか、このサイトをホワイトリストに追加する必要はありません。",
      "このサイトの運営には資金が必要というわけではありません。完全に趣味のサイトだからです。",
      "そもそも広告を設置していないので、当たり前でした。",
      "このポップアップは数秒後に自動的に閉じます。",
      "次回以降はこのポップアップは表示されません。安心して自由なインターネットをお楽しみください。",
    ],
    reveal: "これはジョークスクリプトです。"
  },
  en: {
    title: "Ad Blocker Detected!",
    messages: [
      "The use of ad blockers is not a problem for this site.",
      "You do not need to disable your ad blocker or whitelist this site.",
      "The operation of this site does not require funding, as it is purely a hobby project.",
      "In fact, there are no ads on this site, so it was obvious.",
      "This popup will automatically close in a few seconds.",
      "This popup will not appear again in the future. Enjoy a free and open internet!",
    ],
    reveal: "This is a joke script."
  }
};

export default function AntiAdblock() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [useJp, setUseJp] = useState(false);

  useEffect(() => {
    const adTest = async () => {
      if (typeof localStorage === "undefined" || localStorage.getItem("adtested") === "true"){
        return;
      }
      setUseJp(navigator.language.startsWith("ja"));
      const testURL = "https://ad.doubleclick.net/fakepage.html";
      console.log("testing adblock", testURL);
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 10000);
      let detected = false;
      try {
        const response = await fetch(testURL,{
          method: "HEAD",
          mode: "no-cors",
          signal: ctrl.signal,
        });
        console.log(response);
        detected = response.type === "basic" && response.ok;
      } catch (e) {
        console.log(e);
        detected = true;
      }
      if (detected) {
        if (modalRef.current) {
          modalRef.current.showModal();
          setTimeout(() => {
            if (modalRef.current) {
              modalRef.current.close();
            }
          }, 10000);
        }
      }
      localStorage.setItem("adtested", "true");
    };
    adTest();
  });
  const m = useJp ? adBlockerMessages.ja : adBlockerMessages.en;
  return (
    <dialog ref={modalRef} className="modal">
      <div lang={useJp ? "ja" : "en"} className="modal-box flex flex-col space-y-4">
        <FaCheckCircle size={100} color="green" className="self-center" />
        <h3 className="font-bold text-lg self-center">{m.title}</h3>
        {
          m.messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))
        }
        <p className="text-[8px] text-end italic">{m.reveal}</p>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>閉じる</button>
      </form>
    </dialog>
  );
}
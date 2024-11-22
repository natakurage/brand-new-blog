"use client";

import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function AntiAdblock() {
  useEffect(() => {
    const adTest = async () => {
      if (typeof localStorage === "undefined" || localStorage.getItem("adtested") === "true"){
        return;
      }
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
        const modal = document.getElementById("my_modal_2");
        if (modal) {
          (modal as HTMLDialogElement).showModal();
        }
      }
      localStorage.setItem("adtested", "true");
    };
    adTest();
  });
  return (
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box flex flex-col space-y-4">
        <FaCheckCircle size={100} color="green" className="self-center" />
        <h3 className="font-bold text-lg self-center">広告ブロッカーを検出しました！</h3>
        <p>このサイトでは、広告ブロッカーの使用は特に問題ありません。</p>
        <p>広告ブロッカーを無効にするか、このサイトをホワイトリストに追加する必要はありません。</p>
        <p>このサイトの運営には資金が必要というわけではありません。完全に趣味のサイトだからです。</p>
        <p>そもそも広告を設置していないので、当たり前でした。</p>
        <p>次回以降はこのポップアップは表示されません。安心して自由なインターネットをお楽しみください。</p>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>閉じる</button>
      </form>
    </dialog>
  );
}
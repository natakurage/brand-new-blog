"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function HLSAudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(audio);
      // hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //   audio.play();
      // });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = url;
      // audio.addEventListener("loadedmetadata", () => {
      //   audio.play();
      // });
    } else {
      console.error("HLS is not supported in this browser.");
    }

    return () => {
      if (audio) {
        audio.src = "";
      }
    };
  }, [url]);

  if (!url) {
    return <p>No URL provided.</p>;
  }

  return (
    <audio ref={audioRef} controls className="w-full">
      Your browser does not support the audio element.
    </audio>
  );
}
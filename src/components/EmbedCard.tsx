"use client";

import { getMeta } from "@/app/actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Metadata {
  metadata: {
      website: string;
      title: string;
      description: string | undefined;
      banner: string | undefined;
      themeColor: string | undefined;
  };
  socials: Record<string, string | undefined>;
  favicons: string[];
};

export default function EmbedCard({ url }: { url: string }) {
  const [meta, setMeta] = useState<Metadata>();
  useEffect(() => {
    const temp = async () => {
      setMeta(await getMeta(url));
    };
    temp();
  }, [url]);
  if (!meta) {
    // show skeleton
    return (
      <div className="card glass card-side card-compact bg-base-100 shadow-xl not-prose">
        <figure className="w-1/3 skeleton" />
        <div className="card-body flex-1">
          <h2 className="card-title h-14 line-clamp-2 skeleton" />
          <p className="h-5 skeleton" />
          <div className="flex gap-1 justify-end">
            <div className="w-4 h-4 my-auto skeleton" />
            <span className="w-24 h-5 my-auto skeleton" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card glass card-side card-compact bg-base-100 shadow-xl not-prose">
      {
        meta.metadata.banner && <figure className="w-1/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.metadata.banner}
            alt={meta.metadata.title}
            className="h-full object-cover"
          />
        </figure>
      }
      <div className={`card-body bg-[${meta.metadata.themeColor}] flex-1`}>
        <h2 className="card-title line-clamp-2">{meta.metadata.title}</h2>
        <p className="line-clamp-1">{meta.metadata.description}</p>
        <div className="flex gap-1 justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.favicons[0]}
            alt={meta.metadata.title}
            className="w-4 h-4 my-auto"
          />
          <span>{new URL(meta.metadata.website).host}</span>
        </div>
      </div>
      <Link
        href={url}
        className="absolute w-full h-full top-0 left-0"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  );
}
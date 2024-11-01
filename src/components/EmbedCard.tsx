"use client";

import { getMeta } from "@/app/actions";
import { Metadata } from "@/lib/fetchMetadata";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmbedCard({ url }: { url: string }) {
  const [meta, setMeta] = useState<Metadata>();
  useEffect(() => {
    const temp = async () => {
      setMeta(await getMeta(url));
    };
    temp();
  }, [url]);

  const isInternal = typeof window !== "undefined" && window.location.host === new URL(url).host;

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
      <figure className="w-1/3">
      {
        // eslint-disable-next-line @next/next/no-img-element
        meta.metadata.banner && <img
          src={meta.metadata.banner}
          alt={meta.metadata.title}
          className="h-full aspect-[1.91/1] object-cover"
        />
      }
      </figure>
      <div className={"card-body flex-1" + (meta.metadata.themeColor ? ` bg-[${meta.metadata.themeColor}]` : "")}>
        <h2 className="card-title line-clamp-2">{meta.metadata.title}</h2>
        <p className="line-clamp-1 min-h-5">{meta.metadata.description}</p>
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
        target={isInternal ? undefined :"_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
      />
    </div>
  );
}
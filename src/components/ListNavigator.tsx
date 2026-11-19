"use client";

import { listNavigatorInfo, listNavigatorItem } from "@/lib/content/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const withEllipsis = (str: string, len: number) => (
  str.length > len ? str.substring(0, len - 3) + "..." : str
);

export default function ListNavigator(
  { slug, kind }
: { slug: string, kind: "postList" | "album" }) {
  const router = useRouter();
  const key = useSearchParams().get("key");
  
  const [title, setTitle] = useState<string | undefined>();
  const [listHref, setListHref] = useState<string | undefined>();
  const [prev, setPrev] = useState<listNavigatorItem | null>();
  const [next, setNext] = useState<listNavigatorItem | null>();

  useEffect(() => {
    if (key == null) {
      router.push("?");
      return;
    }
    const f = async () => {
      const searchParams = new URLSearchParams({
        slug,
        key,
        kind,
      });
      const response = await fetch("/api/list-navigator?" + searchParams);
      const navigatorInfo: listNavigatorInfo = await response.json();
      if (navigatorInfo == null) {
        router.push("?");
        return;
      }
      setTitle(navigatorInfo.listTitle);
      setListHref(navigatorInfo.listHref);
      setPrev(navigatorInfo.prev);
      setNext(navigatorInfo.next);
    };
    f();
  }, [key, router, slug, kind]);
  
  return (
    <nav>
      <h2 className="text-sm text-center text-base-content">
        {
          listHref && <Link href={listHref} className="link link-hover">
            {title}
          </Link>
        }
      </h2>
      <div className="join flex justify-center flex-wrap">
        {
          prev ? <Link
            className="join-item btn flex-1 flex-nowrap"
            href={prev.href + "?key=" + key}
          >
            <MdNavigateBefore size={24} />
            <span className="flex-1">{withEllipsis(prev.title, 20)}</span>
          </Link>
          :
          <button className="join-item invisible flex-1 flex-nowrap" />
        }
        {
          next ? <Link
          className="join-item btn flex-1 flex-nowrap"
          href={next.href + "?key=" + key}
        >
          <span className="flex-1">{withEllipsis(next.title, 20)}</span>
          <MdNavigateNext size={24} />
        </Link>
        :
        <button className="join-item invisible flex-1 flex-nowrap" />
        }
      </div>
    </nav>
  );
}
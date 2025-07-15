"use client";

import { listNavigatorInfo, listNavigatorItem } from "@/lib/models";
import { ItemListManagerMap } from "@/lib/cmsUtils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const withEllipsis = (str: string, len: number) => (
  str.length > len ? str.substring(0, len - 3) + "..." : str
);

export default function ListNavigator(
  { slug, managerType, useSlug = false }
: { slug: string, managerType: keyof typeof ItemListManagerMap, useSlug?: boolean }) {
  const router = useRouter();
  const key = useSearchParams().get("key");
  
  const [title, setTitle] = useState<string | undefined>();
  const [typeUrl, setTypeUrl] = useState<string | undefined>();
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
        type: managerType,
        useSlug: useSlug ? "true" : "false"
      });
      const response = await fetch("/api/list-navigator?" + searchParams);
      const navigatorInfo: listNavigatorInfo = await response.json();
      if (navigatorInfo == null) {
        router.push("?");
        return;
      }
      setTitle(navigatorInfo.listTitle);
      setTypeUrl(navigatorInfo.typeUrl);
      setPrev(navigatorInfo.prev);
      setNext(navigatorInfo.next);
    };
    f();
  }, [key, router, slug, managerType, useSlug]);
  
  return (
    <div>
      <h2 className="text-sm text-center text-base-content">
        <Link href={`/${typeUrl}/${key}`} className="link link-hover">
          {title}
        </Link>
      </h2>
      <div className="join flex justify-center flex-wrap">
        {
          prev ? <Link
            className="join-item btn flex-1 flex-nowrap"
            href={`/${prev.typeUrl}/` + prev.slug + "?key=" + key}
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
          href={`/${next.typeUrl}/` + next.slug + "?key=" + key}
        >
          <span className="flex-1">{withEllipsis(next.title, 20)}</span>
          <MdNavigateNext size={24} />
        </Link>
        :
        <button className="join-item invisible flex-1 flex-nowrap" />
        }
      </div>
    </div>
  );
}
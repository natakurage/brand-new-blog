"use client";

import type { ListNavigation } from "@/lib/content/navigation";
import { listParam } from "@/lib/content/href";
import SiteLink from "./SiteLink";
import { useSearchParams } from "next/navigation";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const withEllipsis = (str: string, len: number) => (
  str.length > len ? str.substring(0, len - 3) + "..." : str
);

// 項目を含むリストすべての前後をページに埋め込んでおき、どのリストの中で見ているかはブラウザでクエリから選ぶ（ページを静的に保つため）
export default function ListNavigator({ navigations }: { navigations: ListNavigation[] }) {
  const listSlug = useSearchParams().get(listParam);
  const navigation = navigations.find((n) => n.slug === listSlug);
  if (!navigation) {
    return null;
  }
  const { title, href, prev, next } = navigation;

  return (
    <nav>
      <h2 className="text-sm text-center text-base-content">
        <SiteLink href={href} className="link link-hover">
          {title}
        </SiteLink>
      </h2>
      <div className="join flex justify-center flex-wrap">
        {
          prev ? <SiteLink
            className="join-item btn flex-1 flex-nowrap"
            href={prev.href}
          >
            <MdNavigateBefore size={24} />
            <span className="flex-1">{withEllipsis(prev.title, 20)}</span>
          </SiteLink>
          :
          <button className="join-item invisible flex-1 flex-nowrap" />
        }
        {
          next ? <SiteLink
          className="join-item btn flex-1 flex-nowrap"
          href={next.href}
        >
          <span className="flex-1">{withEllipsis(next.title, 20)}</span>
          <MdNavigateNext size={24} />
        </SiteLink>
        :
        <button className="join-item invisible flex-1 flex-nowrap" />
        }
      </div>
    </nav>
  );
}

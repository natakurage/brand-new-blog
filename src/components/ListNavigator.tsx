"use client";

import { getListTitleAndPosts } from "@/app/actions";
import { BlogPost } from "@/lib/contentful";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const withEllipsis = (str: string, len: number) => (
  str.length > len ? str.substring(0, len - 3) + "..." : str
);

export default function ListNavigator({ slug }: { slug: string }) {
  const router = useRouter();
  const listId = useSearchParams().get("listId");
  
  const [title, setTitle] = useState<string | undefined>();
  const [idx, setIdx] = useState(-1);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (listId == null) {
      router.push("?");
      return;
    }
    const f = async () => {
      const { title: _title, posts: _posts } = await getListTitleAndPosts(listId);
      if (_posts == null || _posts?.length === 0) {
        router.push("?");
        return;
      }
      const _idx = _posts.findIndex((post) => post.slug === slug);
      if (_idx === -1) {
        router.push("?");
        return;
      }
      setTitle(_title);
      setIdx(_idx);
      setPosts(_posts);
    };
    f();
  }, [listId, router, slug]);
  
  if (posts.length === 0) {
    return null;
  }
  const maxIdx = posts.length - 1;
  return (
    <div>
      <h2 className="text-sm text-center text-base-content">{title}</h2>
      <div className="join flex justify-center flex-wrap">
        {
          idx !== 0 ? <Link
            className="join-item btn flex-1 flex-nowrap"
            href={"/articles/" + posts[idx-1].slug + "?listId=" + listId}
          >
            <MdNavigateBefore size={24} />
            <span className="flex-1">{withEllipsis(posts[idx-1].title, 20)}</span>
          </Link>
          :
          <button className="join-item invisible flex-1 flex-nowrap" />
        }
        {
          idx !== maxIdx ? <Link
          className="join-item btn flex-1 flex-nowrap"
          href={"/articles/" + posts[idx+1].slug + "?listId=" + listId}
        >
          <span className="flex-1">{withEllipsis(posts[idx+1].title, 20)}</span>
          <MdNavigateNext size={24} />
        </Link>
        :
        <button className="join-item invisible flex-1 flex-nowrap" />
        }
      </div>
    </div>
  );
}
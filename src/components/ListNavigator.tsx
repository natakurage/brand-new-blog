import { getList } from "@/lib/contentful";
import Link from "next/link";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const withEllipsis = (str: string, len: number) => (
  str.length > len ? str.substring(0, len - 3) + "..." : str
);

export default async function ListNavigator({ current, listId }: { current: string, listId: string }) {
  const { title, posts } = await getList(listId);
  if (posts == null || posts?.length === 0) {
    return null;
  }
  const idx = posts.findIndex((post) => post.slug === current);
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
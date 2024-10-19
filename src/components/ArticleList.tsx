import { EntryCollection, EntrySkeletonType } from "contentful";
import Link from "next/link";
import { MdUpdate } from "react-icons/md";

export default function ArticleList({ entries }: { entries: EntryCollection<EntrySkeletonType, undefined, string> }) {
  return (
    <ul className="space-y-4">
      {entries.items.map((entry) => (
        <li
          key={entry.sys.id}
          className="p-4 hover:bg-neutral hover:bg-opacity-50 rounded-lg"
        >
          <Link href={`/articles/${entry.fields.slug}`}>
            <h2 className="text-xl font-bold">
              {entry.fields.title?.toString()}
            </h2>
            <p>{entry.fields.body?.toString().slice(0, 100)}...</p>
            <div className="flex flex-row gap-1 justify-end">
              <MdUpdate className="my-auto" />
              <time>{new Date(entry.sys.updatedAt).toLocaleDateString()}</time>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
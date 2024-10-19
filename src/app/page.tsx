import client from "@/lib/contentful";
import Link from "next/link";
import { MdUpdate } from "react-icons/md";

export default async function Home() {
  const entries = await client.getEntries({
    content_type: "blogPost",
    limit: 20,
  });
  console.log(entries.items);
  return (
    <div>
      <ul className="space-y-4">
        {entries.items.map((entry) => (
          <li key={entry.sys.id}>
            <Link href={`/articles/${entry.fields.slug}`} className="">
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
    </div>
  );
}

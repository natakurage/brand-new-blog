import metaFetcher from "meta-fetcher";
import Link from "next/link";

export default async function EmbedCard({ url }: { url: string }) {
  const meta = await metaFetcher(url);
  const metadata = meta.metadata;
  return (
    <div className="card glass card-side card-compact bg-base-100 shadow-xl not-prose">
      {
        metadata.banner && <figure className="w-1/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={metadata.banner}
            alt={metadata.title}
            className="h-full object-cover"
          />
        </figure>
      }
      <div className={`card-body bg-[${metadata.themeColor}] flex-1`}>
        <h2 className="card-title line-clamp-2">{metadata.title}</h2>
        <p className="line-clamp-1">{metadata.description}</p>
        <div className="flex gap-1 justify-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.favicons[0]}
            alt={metadata.title}
            className="w-4 h-4 my-auto"
          />
          <span>{new URL(metadata.website).host}</span>
        </div>
      </div>
      <Link href={url} className="absolute w-full h-full top-0 left-0" />
    </div>
  );
}
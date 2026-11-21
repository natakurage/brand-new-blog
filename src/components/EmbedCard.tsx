import { fetchLinkPreview, type Metadata } from "@/lib/fetchMetadata";
import SiteLink from "./SiteLink";
import { Suspense } from "react";

export default function EmbedCard({ url }: { url: string }) {
  return <Suspense fallback={<EmbedCardSkeleton />} >
    <EmbedCardInner url={url}/>
  </Suspense>;
}

async function EmbedCardInner({ url }: { url: string }) {
  const preview = await fetchLinkPreview(url);
  switch (preview.status) {
    case "found":
      return <PreviewCard url={url} meta={preview.metadata} />;
    case "notFound":
      return <LinkOnlyCard url={url} notice="リンク先が見つかりません" />;
    case "noPreview":
    case "unavailable":
      return <LinkOnlyCard url={url} />;
    default:
      return preview satisfies never;
  }
}

function PreviewCard({ url, meta }: { url: string; meta: Metadata }) {
  const isInternal = url.startsWith("/") || typeof window !== "undefined" && window.location.origin === new URL(url).origin;

  return (
    <div
      className="card glass card-side card-compact bg-base-100 shadow-xl my-5 not-prose"
      style={meta.metadata.themeColor ? { borderLeft: `6px solid ${meta.metadata.themeColor}` } : undefined}
    >
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
      <div className="card-body flex-1">
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
      <SiteLink
        href={url}
        className="absolute w-full h-full top-0 left-0"
        target={isInternal ? undefined :"_blank"}
        rel={isInternal ? undefined : "noopener noreferrer"}
      />
    </div>
  );
}

function LinkOnlyCard({ url, notice }: { url: string; notice?: string }) {
  return (
    <div className="card glass card-compact bg-base-100 shadow-xl my-5 not-prose">
      <div className="card-body">
        {notice && <p className="text-warning">{notice}</p>}
        <SiteLink
          href={url}
          className="link break-all"
          target={url.startsWith("/") ? undefined : "_blank"}
          rel={url.startsWith("/") ? undefined : "noopener noreferrer"}
        >
          {url}
        </SiteLink>
      </div>
    </div>
  );
}

function EmbedCardSkeleton() {
  return (
    <div className="card glass card-side card-compact bg-base-100 shadow-xl my-5 not-prose">
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
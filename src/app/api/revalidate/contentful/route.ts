import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { repositories } from '@/lib/repositories';
import { isSanityContentType, kindOfSanityType } from '@/lib/sanity/webhook';
import type { CollectionSummary, Content, Kind } from '@/lib/content/types';
import { hrefOf, rawHref } from '@/lib/content/href';

const ctx = { preview: true };

const findContent = (kind: Exclude<Kind, "tag">, slug: string): Promise<Content | null> => {
  switch (kind) {
    case "article":
      return repositories.articles.findBySlug(slug, ctx);
    case "song":
      return repositories.songs.findBySlug(slug, ctx);
    case "postList":
      return repositories.postLists.findBySlug(slug, ctx);
    case "album":
      return repositories.albums.findBySlug(slug, ctx);
    default:
      return kind satisfies never;
  }
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  const { entityId, contentType, slug } = await req.json();
  if (!entityId || !contentType || !slug) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  if (typeof entityId !== 'string' || typeof contentType !== 'string' || typeof slug !== 'string') {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  if (!isSanityContentType(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }
  const blogData = await findContent(kindOfSanityType[contentType], slug);
  // Revalidate itself and collection
  const tagsToRevalidate = [
    `${contentType}:id:${entityId}`,
    `${contentType}:slug:${slug}`,
    `${contentType}-collection`
  ];
  const pathsToRevalidate: string[] = [];
  if (blogData) {
    const itemsToRevalidate: { kind: Kind; slug: string }[] = [blogData];

    // Revalidate Tag collection
    if (blogData.tags.length > 0) {
      tagsToRevalidate.push("tags-collection");
    }
    // Revalidate all tags associated with the item
    blogData.tags.forEach((tag) => {
      itemsToRevalidate.push(tag);
      tagsToRevalidate.push(`tags:slug:${tag.slug}`);
    });
    // Revalidate ListItems that contain the item
    let items: CollectionSummary[] = [];
    if (blogData.kind === "article") {
      items = await repositories.postLists.containing(blogData.slug, ctx);

      // BlogPost の場合は .md / .txt のパスも再検証対象に登録
      pathsToRevalidate.push(
        rawHref(blogData, "md"),
        rawHref(blogData, "txt"),
        `/api/raw/${blogData.slug}/md`,
        `/api/raw/${blogData.slug}/txt`
      );
    } else if (blogData.kind === "song") {
      items = await repositories.albums.containing(blogData.slug, ctx);
    }
    if (items.length > 0) {
      tagsToRevalidate.push(`${contentType}-collection`);
    }
    items.forEach((list) => {
      itemsToRevalidate.push(list);
      tagsToRevalidate.push(`${contentType}:slug:${list.slug}`);
    });
    pathsToRevalidate.push(...itemsToRevalidate.map(hrefOf));
  }

  // 重複パスの排除と再検証
  const uniquePaths = Array.from(new Set(pathsToRevalidate));

  uniquePaths.forEach((p) => revalidatePath(p));
  tagsToRevalidate.forEach((tag) => revalidateTag(tag, "max"));
  return NextResponse.json({
    revalidatedPaths: uniquePaths,
    revalidatedTags: tagsToRevalidate,
  });
}

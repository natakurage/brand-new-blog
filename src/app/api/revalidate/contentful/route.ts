import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { PostListManager, AlbumManager } from '@/lib/cms';
import { BlogDataManagerMap, cmsToType, isValidContentType } from '@/lib/cmsUtils';
import { Tag, BlogData, getPath, PostList, Album } from '@/lib/models';

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
  if (!isValidContentType(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }
  const manager = new BlogDataManagerMap[cmsToType[contentType]]();
  const blogData = await manager.defaultFetcher(contentType === 'postList' ? entityId : slug, true);
  if (!blogData) {
    return NextResponse.json({ error: 'Blog data not found' }, { status: 404 });
  }
  // Revalidate itself and collection
  const itemsToRevalidate: (BlogData | Tag)[] = [blogData]; // maybe unnecessary, but just in case
  const tagsToRevalidate = [`${contentType}:slug:${blogData.slug}`, `${contentType}-collection`];
  if (blogData) {
    // Revalidate Tag collection
    if (blogData.tags && blogData.tags.length > 0) {
      tagsToRevalidate.push("tags-collection");
    }
    // Revalidate all tags associated with the item
    blogData.tags?.forEach((tag) => {
      itemsToRevalidate.push(tag);
      tagsToRevalidate.push(`tags:slug:${tag.slug}`);
    });
    // Revalidate ListItems that contain the item
    let items: (PostList | Album)[] = [];
    if (cmsToType[contentType] === "BlogPost") {
      items = await new PostListManager().getListsByPost(blogData.slug, true);
    } else if (cmsToType[contentType] === "Song") {
      items = await new AlbumManager().getAlbumsBySong(blogData.slug, true);
    }
    if (items) {
      if (items.length > 0) {
        tagsToRevalidate.push(`${contentType}-collection`);
      }
      items.forEach((list) => {
        itemsToRevalidate.push(list);
        tagsToRevalidate.push(`${contentType}:slug:${list.slug}`);
      });
    }
  }
  itemsToRevalidate.forEach((p) => revalidatePath(getPath(p)));
  tagsToRevalidate.forEach((tag) => revalidateTag(tag));
  return NextResponse.json({
    revalidatedPaths: itemsToRevalidate.map(getPath),
    revalidatedTags: tagsToRevalidate,
  });
}
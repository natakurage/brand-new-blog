import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PostListManager, AlbumManager } from '@/lib/cms';
import { BlogDataManagerMap, cmsToType, isValidContentType } from '@/lib/cmsUtils';
import { Tag, BlogData, getPath } from '@/lib/models';

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
  const itemsToRevalidate: (BlogData | Tag)[] = [blogData];
  if (blogData) {
    // Revalidate all tags associated with the item
    blogData.tags?.forEach((tag) => {
      itemsToRevalidate.push(tag);
    });
    // Revalidate paths for related items
    // Performs minimal type checks here
    if (cmsToType[contentType] === "BlogPost") {
      const lists = await new PostListManager().getListsByPost(blogData.slug, true);
      lists.forEach((list) => {
        itemsToRevalidate.push(list);
      });
    } else if (cmsToType[contentType] === "Song") {
      const albums = await new AlbumManager().getAlbumsBySong(blogData.slug);
      albums.forEach((album) => {
        itemsToRevalidate.push(album);
      });
    }
  }
  itemsToRevalidate.forEach((p) => revalidatePath(getPath(p)));
  return NextResponse.json({ revalidatedPaths: itemsToRevalidate.map(getPath) });
}
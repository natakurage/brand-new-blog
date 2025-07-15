import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { BlogDataManagerMap } from '@/lib/cmsUtils';

const cmsToType = {
  blogPost: 'BlogPost',
  song: 'Song',
  postList: 'PostList',
  musicAlbum: 'Album'
} as const;

const isValidContentType = (type: string): type is keyof typeof cmsToType => {
  return type in cmsToType;
};

const paths = {
  blogPost: "/articles/[slug]",
  song: "/songs/[slug]",
  postList: "/lists/[id]",
  musicAlbum: "/albums/[slug]"
} as const;

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
  const path = paths[contentType]?.replace('[slug]', slug).replace('[id]', entityId);
  if (!path) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }
  const pathsToRevalidate = [path];
  const manager = new BlogDataManagerMap[cmsToType[contentType]]();
  const items = await manager.defaultFetcher(contentType === 'postList' ? entityId : slug, false);
  if (items) {
    // Revalidate all tags associated with the item
    items.tags?.forEach((tag) => {
      pathsToRevalidate.push(`/tags/${tag.slug}`);
    });
    // Revalidate paths for related items
    // Performs minimal type checks here
    if ("posts" in items && Array.isArray(items.posts)) {
      items.posts.forEach((post) => {
        pathsToRevalidate.push(`/articles/${post.slug}`);
      });
    } else if ("tracks" in items && Array.isArray(items.tracks)) {
      items.tracks.forEach((track) => {
        pathsToRevalidate.push(`/songs/${track.slug}`);
      });
    }
  }
  pathsToRevalidate.forEach((p) => revalidatePath(p));
  return NextResponse.json({ revalidatedPaths: pathsToRevalidate });
}
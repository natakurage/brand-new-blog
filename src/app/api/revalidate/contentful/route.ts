import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const paths = new Map<string, string>([
  ["blogPost", "/articles/[slug]"],
  ["song", "/songs/[slug]"],
  ["postList", "/lists/[id]"],
  ["musicAlbum", "/albums/[slug]"]
]);

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
  const path = paths.get(contentType)?.replace('[slug]', slug).replace('[id]', entityId);
  if (!path) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }
  revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
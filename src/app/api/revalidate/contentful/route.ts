import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isSanityContentType, kindOfSanityType } from '@/lib/sanity/webhook';
import { tagsToInvalidate } from '@/lib/content/cacheTags';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  const { contentType, slug } = await req.json();
  if (typeof contentType !== 'string' || typeof slug !== 'string' || !slug) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  if (!isSanityContentType(contentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }
  const tags = tagsToInvalidate(kindOfSanityType[contentType], [slug]);
  tags.forEach((tag) => revalidateTag(tag, "max"));
  return NextResponse.json({ revalidatedTags: tags });
}

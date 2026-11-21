import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { parseChangeNotification } from '@/lib/source';
import { tagsToInvalidate } from '@/lib/content/cacheTags';

// 旧形式の webhook（{ contentType, slug }）用。Sanity の設定を /api/revalidate に切り替えたら削除する
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  const { contentType, slug } = await req.json();
  const change = parseChangeNotification({ _type: contentType, slugs: [slug] });
  if (!change) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  const tags = tagsToInvalidate(change);
  tags.forEach((tag) => revalidateTag(tag, "max"));
  return NextResponse.json({ revalidatedTags: tags });
}

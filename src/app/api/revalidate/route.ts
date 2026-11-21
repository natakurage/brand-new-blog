import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseChangeNotification } from "@/lib/source";
import { tagsToInvalidate } from "@/lib/content/cacheTags";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  const change = parseChangeNotification(await req.json().catch(() => null));
  if (!change) {
    return NextResponse.json({ error: "Invalid or unsupported notification" }, { status: 400 });
  }
  const tags = tagsToInvalidate(change);
  tags.forEach((tag) => revalidateTag(tag, "max"));
  return NextResponse.json({ revalidatedTags: tags });
}

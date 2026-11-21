import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseChangeNotification } from "@/lib/source";
import { tagsToInvalidate } from "@/lib/content/cacheTags";

export async function POST(req: NextRequest) {
  const notification = await parseChangeNotification(req);
  switch (notification.status) {
    case "unauthorized":
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    case "unsupported":
      return NextResponse.json({ error: "Invalid or unsupported notification" }, { status: 400 });
    case "accepted": {
      const tags = tagsToInvalidate(notification.change);
      tags.forEach((tag) => revalidateTag(tag, "max"));
      return NextResponse.json({ revalidatedTags: tags });
    }
    default:
      return notification satisfies never;
  }
}

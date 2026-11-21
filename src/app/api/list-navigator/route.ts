import { repositories } from "@/lib/repositories";
import { hrefOf } from "@/lib/content/href";
import type { Album, PostList, listNavigatorInfo } from "@/lib/content/types";
import { NextRequest, NextResponse } from "next/server";

const responseWithError = (error: string, status: number) => {
  return new NextResponse(JSON.stringify({ error }), { status });
};

const findList = (kind: string, slug: string): Promise<PostList | Album | null> | null => {
  switch (kind) {
    case "postList":
      return repositories.postLists.findBySlug(slug);
    case "album":
      return repositories.albums.findBySlug(slug);
    default:
      return null;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");
  const currentSlug = searchParams.get("slug");
  const kind = searchParams.get("kind");
  // check params
  if (!key || !currentSlug || !kind) return responseWithError("Missing parameters", 400);
  // check kind
  const listPromise = findList(kind, key);
  if (!listPromise) return responseWithError("Invalid kind", 400);
  // get list
  const list = await listPromise;
  if (!list) return responseWithError("List not found", 404);
  // get info
  const { title, items } = list;
  // check index
  const currentId = items.findIndex((item) => item.slug === currentSlug);
  if (currentId === -1) return responseWithError("Item not found", 404);
  const prev = items[currentId - 1] ?? null;
  const next = items[currentId + 1] ?? null;
  const navigatorInfo: listNavigatorInfo = {
    listTitle: title,
    listHref: hrefOf(list),
    prev: prev == null ? null : {
      title: prev.title,
      href: hrefOf(prev),
    },
    next: next == null ? null : {
      title: next.title,
      href: hrefOf(next),
    }
  };
  return new NextResponse(JSON.stringify(navigatorInfo), { status: 200 });
}

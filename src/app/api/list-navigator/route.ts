import { ItemListManagerMap, isItemListManagerMapKey } from "@/lib/contentful";
import { BlogData, listNavigatorInfo } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";

const responseWithError = (error: string, status: number) => {
  return new NextResponse(JSON.stringify({ error }), { status });
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");
  const currentSlug = searchParams.get("slug");
  const managerType = searchParams.get("type");
  const useSlug = searchParams.get("useSlug");
  // check params
  if (!key || !currentSlug || !managerType) return responseWithError("Missing parameters", 400);
  // check manager type
  if (!isItemListManagerMapKey(managerType)) return responseWithError("Invalid manager type", 400);
  const manager = new ItemListManagerMap[managerType]();
  if (!manager) return responseWithError("Type not found", 400);
  // get list
  const list = useSlug === "true" ? await manager.getBySlug(key) : await manager.get(key);
  if (!list) return responseWithError("List not found", 404);
  // get info
  const { title, items } = list;
  // check index
  const currentId = items.findIndex((item: BlogData) => item.slug === currentSlug);
  if (currentId === -1) return responseWithError("Item not found", 404);
  const prev = items[currentId - 1] ?? null;
  const next = items[currentId + 1] ?? null;
  const navigatorInfo: listNavigatorInfo = {
    listTitle: title,
    typeUrl: list.typeUrl,
    prev: prev == null ? null : {
      title: prev.title,
      slug: prev.slug,
      typeUrl: prev.typeUrl
    },
    next: next == null ? null : {
      title: next.title,
      slug: next.slug,
      typeUrl: next.typeUrl
    }
  };
  return new NextResponse(JSON.stringify(navigatorInfo), { status: 200 });
}
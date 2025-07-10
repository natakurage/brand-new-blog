import { ItemListManagerMap, ItemListManagerMapKeys } from "@/lib/contentful";
import { listNavigatorInfo } from "@/lib/models";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");
  const currentSlug = searchParams.get("slug");
  const managerType = searchParams.get("type");
  const useSlug = searchParams.get("useSlug");
  // check params
  if (!key || !currentSlug || !managerType) return new Response(null, { status: 400 });
  // check manager type
  const manager = ItemListManagerMap.get(managerType as ItemListManagerMapKeys);
  if (!manager) return new Response(null, { status: 400 });
  // get list
  const list = useSlug === "true" ? await manager.getBySlug(key) : await manager.get(key);
  if (!list) return new Response(null, { status: 404 });
  // get info
  const { title, items } = list;
  // check index
  const currentId = items.findIndex((item) => item.slug === currentSlug);
  if (currentId === -1) return new Response(null, { status: 404 });
  const prev = items[currentId - 1] ?? null;
  const next = items[currentId + 1] ?? null;
  return new Response(JSON.stringify({
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
  } as listNavigatorInfo), { status: 200 });
}
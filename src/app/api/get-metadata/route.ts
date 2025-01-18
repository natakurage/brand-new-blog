import { fetchMetadata } from "@/lib/fetchMetadata";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  if (!url) return new Response(null, { status: 400 });
  const meta = await fetchMetadata(url);
  return new Response(JSON.stringify(meta), { status: 200 });
}
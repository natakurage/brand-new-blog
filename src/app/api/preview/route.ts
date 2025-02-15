import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
 
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const type = searchParams.get("type");
 
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }
  
  draftMode().enable();
 
  if (slug) {
    if (type == "article")
      redirect(`/articles/${slug}`);
    else if (type == "song")
      redirect(`/songs/${slug}`);
  }
 
  redirect("/");
}
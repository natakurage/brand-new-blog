import { draftMode } from "next/headers";
 
export const dynamic = "force-dynamic";

export async function GET() {
  const dMode = await draftMode();
  if (dMode.isEnabled) {
    (await draftMode()).disable();
    return new Response("Preview mode disabled", { status: 200 });
  }
  return new Response(null, { status: 204 });
}
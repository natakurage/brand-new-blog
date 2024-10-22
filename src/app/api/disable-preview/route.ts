import { draftMode } from "next/headers";
 
export async function GET() {
  const dMode = draftMode();
  if (dMode.isEnabled) {
    draftMode().disable();
    return new Response("Preview mode disabled", { status: 200 });
  }
  return new Response(null, { status: 204 });
}
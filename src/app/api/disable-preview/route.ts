import { draftMode } from "next/headers";
import { connection } from "next/server";

export async function GET() {
  await connection();
  const dMode = await draftMode();
  if (dMode.isEnabled) {
    (await draftMode()).disable();
    return new Response("Preview mode disabled", { status: 200 });
  }
  return new Response(null, { status: 204 });
}
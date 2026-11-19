import { getClient } from "./client";
import type { GlobalSettings } from "@/lib/content/types";
import { createSanitySiteSettingsRepository } from "./repositories/siteSettings";

const repository = createSanitySiteSettingsRepository((ctx) => getClient(ctx.preview));

export async function loadGlobalSettings(): Promise<GlobalSettings> {
  return repository.get();
}

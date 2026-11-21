import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { getClient } from "./client";

export const { GET: enableSanityDraftMode } = defineEnableDraftMode({ client: getClient(true) });

export { VisualEditing as SanityVisualEditing } from "next-sanity/visual-editing";

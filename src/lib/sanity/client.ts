import { createClient } from "next-sanity";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET_NAME;
const viewerToken = process.env.SANITY_VIEWER_TOKEN;

if (!projectId || !dataset || !viewerToken) {
  throw new Error("Missing Sanity credentials.");
}

const normalClient = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: "2025-02-19",
});

const previewClient = createClient({
  projectId,
  dataset,
  useCdn: false,
  token: viewerToken,
  perspective: "drafts",
  ignoreBrowserTokenWarning: true,
  apiVersion: "2025-02-19",
});

export const getClient = (preview: boolean) => preview ? previewClient : normalClient;

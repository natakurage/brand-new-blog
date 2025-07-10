import { createClient } from "contentful";

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const previewAccessToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

if (!space || !accessToken || !previewAccessToken) {
  throw new Error("Missing Contentful credentials.");
}

const normalClient = createClient({
  space, accessToken,
});

const previewClient = createClient({
  space, accessToken: previewAccessToken, host: "preview.contentful.com",
});

export const getClient = (preview: boolean) => preview ? previewClient : normalClient;

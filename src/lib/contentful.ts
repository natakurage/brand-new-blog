import { createClient, EntriesQueries, EntrySkeletonType } from "contentful";

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const previewAccessToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

if (!space || !accessToken || !previewAccessToken) {
  throw new Error("Missing Contentful credentials.");
}

const client = createClient({
  space, accessToken,
});

const previewClient = createClient({
  space, accessToken: previewAccessToken, host: "preview.contentful.com",
});

const getClient = (preview: boolean) => preview ? previewClient : client;

export interface BlogPost {
  title: string;
  slug: string;
  body: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  showToc: boolean;
}

export default async function getPosts(
  query: EntriesQueries<EntrySkeletonType, undefined>,
  preview: boolean = false
) {
  const entries = await getClient(preview).getEntries(query);
  return entries.items.map((item) => {
    const { title, slug, body, license, tags, showToc } = item.fields;
    const { createdAt, updatedAt } = item.sys;
    return {
      title,
      slug,
      body,
      createdAt,
      updatedAt,
      license,
      tags,
      showToc
    } as BlogPost;
  });
}
import { createClient, EntriesQueries, EntrySkeletonType } from "contentful";

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error("Missing Contentful credentials.");
}

const client = createClient({
  space, accessToken,
});

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

export default async function getPosts(query: EntriesQueries<EntrySkeletonType, undefined>) {
  const entries = await client.getEntries(query);
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
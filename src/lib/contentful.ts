import { createClient, EntriesQueries, EntrySkeletonType } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID ?? "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ?? "",
});

export interface BlogPost {
  title: string;
  slug: string;
  body: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export default async function getPosts(query: EntriesQueries<EntrySkeletonType, undefined>) {
  const entries = await client.getEntries(query);
  return entries.items.map((item) => {
    const { title, slug, body, license, tags } = item.fields;
    const { createdAt, updatedAt } = item.sys;
    return {
      title,
      slug,
      body,
      createdAt,
      updatedAt,
      license,
      tags
    } as BlogPost;
  });
}
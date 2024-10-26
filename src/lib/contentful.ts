import { createClient, EntriesQueries, Entry, EntrySkeletonType } from "contentful";

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
  id: string;
  title: string;
  slug: string;
  body: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  showToc: boolean;
}

export interface PostList {
  id: string;
  title: string;
  posts?: BlogPost[];
  description: string;
}

type Filter = Omit<EntriesQueries<EntrySkeletonType, undefined>, "content_type" | "limit" | "skip">

export async function getPosts(
  {
    limit = 10,
    offset = 0,
    preview = false,
    filter = {}
  } : {
    limit?: number,
    offset?: number,
    preview?: boolean,
    filter?: Filter
  },
) {
  const entries = await getClient(preview).getEntries({
    content_type: "blogPost",
    limit,
    skip: offset * limit,
    ...filter
  });
  return {
    posts: entries.items.map((item) => {
      const { title, slug, body, license, tags, showToc } = item.fields;
      const { createdAt, updatedAt } = item.sys;
      return {
          id: item.sys.id,
          title,
          slug,
          body,
          createdAt,
          updatedAt,
          license,
          tags,
          showToc
        } as BlogPost;
    }),
    total: entries.total,
    errors: entries.errors,
    includes: entries.includes,
    limit: entries.limit,
    skip: entries.skip
  };
}

export async function getList(id: string, preview = false) {
  const entry = await getClient(preview).getEntry(id);
  if (entry.sys.contentType.sys.id !== "postList") {
    throw new Error("Invalid content type");
  }
  const posts = entry.fields.posts as Entry[];
  return {
    posts: posts?.map((item) => {
      const { title, slug, body, license, tags, showToc } = item.fields;
      const { createdAt, updatedAt } = item.sys;
      return {
          id: item.sys.id,
          title,
          slug,
          body,
          createdAt,
          updatedAt,
          license,
          tags,
          showToc
        } as BlogPost;
    }),
    title: entry.fields.title,
    description: entry.fields.description
  } as PostList;
}

export async function getLists(
  {
    limit = 10,
    offset = 0,
    preview = false,
    filter = {}
  } : {
    limit?: number,
    offset?: number,
    preview?: boolean,
    filter?: Filter
  }
) {;
  const entries = await getClient(preview).getEntries({
    content_type: "postList",
    limit,
    select: ["fields.title","fields.description"],
    skip: offset * limit,
    ...filter
  });
  return {
    lists: entries.items.map((item) => {
      const { title, description } = item.fields;
      return {
          id: item.sys.id,
          title,
          description
        } as PostList;
    }),
    total: entries.total,
    errors: entries.errors,
    includes: entries.includes,
    limit: entries.limit,
    skip: entries.skip
  };
}
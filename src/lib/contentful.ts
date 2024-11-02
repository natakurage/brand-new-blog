import { ContentfulClientApi, createClient, EntriesQueries, Entry, EntrySkeletonType, Tag } from "contentful";

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

const getClient = (preview: boolean) => preview ? previewClient : normalClient;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  showToc: boolean;
}

export interface PostList {
  id: string;
  title: string;
  posts?: BlogPost[];
  description: string;
}

type Filter = Omit<EntriesQueries<EntrySkeletonType, undefined>, "content_type" | "limit" | "skip">

const tagsCache = new Map();

export async function getTagWithCache(id: string, client?: ContentfulClientApi<undefined>) {
  if (!client) {
    client = getClient(false);
  }
  if (tagsCache.has(id)) {
    return tagsCache.get(id);
  }
  const tag = await client.getTag(id);
  tagsCache.set(id, tag);
  return tag;
}

async function EntryToPost(entry: Entry, client: ContentfulClientApi<undefined>) {
    const { title, slug, body, license, showToc } = entry.fields;
    const { createdAt, updatedAt } = entry.sys;
    const tags = await Promise.all(
      entry.metadata.tags.map(async (tag) => (
        (await getTagWithCache(tag.sys.id, client))
      ))
    );
    return {
      id: entry.sys.id,
      title,
      slug,
      body,
      createdAt,
      updatedAt,
      license,
      tags,
      showToc
    } as BlogPost;
}

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
  const client = getClient(preview);
  const entries = await client.getEntries({
    content_type: "blogPost",
    limit,
    skip: offset * limit,
    ...filter,
    include: 1
  });
  return {
    posts: await Promise.all(
      entries.items.map((item) => (
      EntryToPost(item, client)
    ))),
    total: entries.total,
    errors: entries.errors,
    includes: entries.includes,
    limit: entries.limit,
    skip: entries.skip
  };
}

export async function getRelatedPosts(
  {
    slug,
    tagIds = [],
    limit = 6
  } : {
    slug: string,
    tagIds?: string[],
    limit?: number
  }
) {
  return getPosts({
    limit,
    filter: {
      "metadata.tags.sys.id[in]": tagIds,
      "fields.slug[ne]": slug,
    },
  });
}

export async function getList(id: string, preview = false) {
  const client = getClient(preview);
  let entry = null;
  try {
    entry = await client.getEntry(id);
  } catch {
    return null;
  }
  if (entry.sys.contentType.sys.id !== "postList") {
    throw new Error("Invalid content type");
  }
  const entries = entry.fields.posts as Entry[];
  return {
    id: entry.sys.id,
    posts: await Promise.all(
      entries.map((item) => (
      EntryToPost(item, client)
    ))),
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
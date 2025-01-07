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

export interface Song {
  id: string;
  title: string;
  url: string[];
  artist: string[];
  releaseDate: string;
  slug: string;
  description: string;
  credit: string[];
  lyrics: string;
  license?: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string;
  license?: string;
  createdAt: string;
  updatedAt: string;
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

export async function getAllPostSlugs() {
  const client = getClient(false);
  const entries = await client.getEntries({
    content_type: "blogPost",
    select: ["fields.slug"],
  });
  return entries.items.map((item) => item.fields.slug);
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

export async function getSong(slug: string, preview = false) {
  const client = getClient(preview);
  let entry = null;
  try {
    const entries = await client.getEntries({
      content_type: "song",
      "fields.slug": slug
    });
    if (entries.items.length === 0) {
      return null;
    }
    entry = entries.items[0];
  } catch {
    return null;
  }
  if (entry.sys.contentType.sys.id !== "song") {
    throw new Error("Invalid content type");
  }
  const tags = await Promise.all(
    entry.metadata.tags.map(async (tag) => (
      (await getTagWithCache(tag.sys.id, client))
    ))
  );
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    url: entry.fields.url,
    artist: entry.fields.artist,
    releaseDate: entry.fields.releaseDate,
    slug: entry.fields.slug,
    description: entry.fields.description,
    credit: entry.fields.credit,
    lyrics: entry.fields.lyrics,
    license: entry.fields.license,
    tags,
    createdAt: entry.sys.createdAt,
    updatedAt: entry.sys.updatedAt,
  } as Song;
}

export async function getAllSongSlugs() {
  const client = getClient(false);
  const entries = await client.getEntries({
    content_type: "song",
    select: ["fields.slug"],
  });
  return entries.items.map((item) => item.fields.slug);
}

export async function getAlbum(id: string, preview = false) {
  const client = getClient(preview);
  let entry = null;
  try {
    entry = await client.getEntry(id);
  } catch {
    return null;
  }
  if (entry.sys.contentType.sys.id !== "album") {
    throw new Error("Invalid content type");
  }
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    slug: entry.fields.slug,
    description: entry.fields.description,
    license: entry.fields.license,
    createdAt: entry.sys.createdAt,
    updatedAt: entry.sys.updatedAt,
  } as Album;
}
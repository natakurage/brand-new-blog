import { ContentfulClientApi, createClient, EntriesQueries, Entry, EntrySkeletonType, LocaleCode, Tag } from "contentful";
import { TypeBlogPost, TypeBlogPostSkeleton, TypeMusicAlbum, TypeMusicAlbumSkeleton, TypePostList, TypePostListSkeleton, TypeSong, TypeSongSkeleton } from "../../@types/contentful";

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

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  license?: string;
  typeUrl: string;
}

export interface ItemList<T extends BlogItem> {
  id: string;
  title: string;
  slug: string;
  items: T[];
  description?: string;
  typeUrl: string;
}

export class BlogPost implements BlogItem {
  typeUrl = "articles";

  constructor(
    public id: string,
    public title: string,
    public slug: string,
    public content: string,
    public createdAt: string,
    public updatedAt: string,
    public tags?: Tag[],
    public license?: string,
    public showToc?: boolean
  ) {}
}

export class Song implements BlogItem {
  typeUrl = "songs";

  constructor(
    public id: string,
    public title: string,
    public slug: string,
    public content: string,
    public createdAt: string,
    public updatedAt: string,
    public artist: string[],
    public credit?: string[],
    public lyrics?: string,
    public releaseDate?: string,
    public tags?: Tag[],
    public license?: string,
    public url?: string[]
  ) {}
}

export class PostList implements ItemList<BlogPost> {
  typeUrl = "lists";

  constructor(
    public id: string,
    public title: string,
    public slug: string,
    public items: BlogPost[],
    public description?: string
  ) {}
};

export class Album implements ItemList<Song> {
  typeUrl = "albums";
  
  constructor(
    public id: string,
    public title: string,
    public slug: string,
    public items: Song[],
    public description?: string,
    public releaseDate?: string,
    public artist?: string[],
    public credit?: string[],
    public tags?: Tag[],
    public license?: string
  ) {}
}

export abstract class BlogItemManager<
  EntrySkeleton extends EntrySkeletonType,
  Locales extends LocaleCode,
  ItemType extends BlogItem
> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<ItemType>;

  async query(
    {
      preview = false,
      limit = 10,
      page = 0,
      filter = {}
    } :
    {
      preview?: boolean,
      limit?: number,
      page?: number,
      filter?: Filter<EntrySkeleton>
    },
  ) {
    const client = getClient(preview);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      limit,
      skip: page * limit,
      ...filter
    });
    return {
      items: await Promise.all(
        entries.items.map((item) => (
        this.fromEntry(item, client)
      ))),
      total: entries.total,
      errors: entries.errors,
      includes: entries.includes,
      limit: entries.limit,
      skip: entries.skip
    };
  }

  async getBySlug(
    slug: string,
    preview = false
  ) {
    const items = await this.query({ filter: { "fields.slug": slug }, preview, limit: 1 });
    if (items.items.length === 0) {
      return null;
    }
    return items.items[0];
  }

  async getAllSlugs() {
    const client = getClient(false);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      select: ["fields.slug"],
    });
    return entries.items.map((item) => item.fields.slug);
  }
}

export abstract class ItemListManager<
  EntrySkeleton extends EntrySkeletonType,
  Locales extends LocaleCode,
  ListType extends ItemList<BlogItem>
> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<ListType>;

  async get(
    id: string,
    preview = false
  ) {
    const client = getClient(preview);
    let entry = null;
    try {
      entry = await client.getEntry<EntrySkeleton, Locales>(id);
    } catch {
      return null;
    }
    return this.fromEntry(entry, client);
  }

  async query(
    {
      limit = 10,
      page = 0,
      preview = false,
      includeItems = false,
      filter = {}
    } : {
      limit?: number,
      page?: number,
      preview?: boolean,
      includeItems?: boolean,
      filter?: Filter<EntrySkeleton>
    }
  ) {
    const client = getClient(preview);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      limit,
      include: includeItems ? undefined : 0,
      skip: page * limit,
      ...filter
    });
    return {
      lists: await Promise.all(entries.items.map((item) => {
        return this.fromEntry(item, client);
      })),
      total: entries.total,
      errors: entries.errors,
      includes: entries.includes,
      limit: entries.limit,
      skip: entries.skip
    };
  }

  async getBySlug(
    slug: string,
    preview = false
  ) {
    const lists = await this.query({ filter: { "fields.slug": slug }, preview, limit: 1, includeItems: true });
    if (lists.lists.length === 0) {
      return null;
    }
    return lists.lists[0];
  }
}

export class BlogPostManager extends BlogItemManager<
  TypeBlogPostSkeleton,
  "ja",
  BlogPost
> {
  contentType = "blogPost";
  override async fromEntry(entry: TypeBlogPost<undefined, "ja">, client: ContentfulClientApi<undefined>) {
    const { title, slug, body, license, showToc } = entry.fields;
    const { createdAt, updatedAt } = entry.sys;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    return new BlogPost(entry.sys.id, title, slug, body, createdAt, updatedAt, tags, license, showToc);
  }

  async getRelatedPosts(
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
    return this.query({
      limit,
      filter: {
        "metadata.tags.sys.id[in]": tagIds,
        "fields.slug[ne]": slug,
      },
    });
  }
}

export class SongManager extends BlogItemManager<
  TypeSongSkeleton,
  "ja",
  Song
> {
  contentType = "song";
  override async fromEntry(entry: TypeSong<undefined, "ja">, client: ContentfulClientApi<undefined>) {
    const { title, slug, description, artist, releaseDate, credit, lyrics, license, url } = entry.fields;
    const { createdAt, updatedAt } = entry.sys;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    return new Song(entry.sys.id, title, slug, description ?? "", createdAt, updatedAt, artist, credit, lyrics, releaseDate, tags, license, url);
  }
}

export class PostListManager extends ItemListManager<
  TypePostListSkeleton,
  "ja",
  PostList
> {
  contentType = "postList";
  override async fromEntry(entry: TypePostList<undefined, "ja">, client: ContentfulClientApi<undefined>) {
    const { title, slug, description } = entry.fields;
    const items = await Promise.all(entry.fields.posts.map((post) => {
      if (!("metadata" in post)) return null;
      return new BlogPostManager().fromEntry(post, client);
    }));
    const nonNullItems = items.filter((item) => item !== null);
    return new PostList(entry.sys.id, title, slug, nonNullItems, description);
  }
}

export class AlbumManager extends ItemListManager<
  TypeMusicAlbumSkeleton,
  "ja",
  Album
> {
  contentType = "musicAlbum";
  override async fromEntry(entry: TypeMusicAlbum<undefined, "ja">, client: ContentfulClientApi<undefined>) {
    const { title, slug, description, releaseDate, artist, credit, license } = entry.fields;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    const items = await Promise.all(entry.fields.tracks.map((song) => {
      if (!("metadata" in song)) return null;
      return new SongManager().fromEntry(song, client);
    }));
    const nonNullItems = items.filter((item) => item !== null);
    return new Album(entry.sys.id, title, slug, nonNullItems, description, releaseDate, artist, credit, tags, license);
  }
}

export type BlogItemManagerJa<
  EntrySkeleton extends EntrySkeletonType,
  ItemType extends BlogItem
> = BlogItemManager<EntrySkeleton, "ja", ItemType>;

export type ItemListManagerJa<
  EntrySkeleton extends EntrySkeletonType,
  ItemType extends ItemList<BlogItem>
> = ItemListManager<EntrySkeleton, "ja", ItemType>;

export type BlogItemManagerMapKeys = "BlogPost" | "Song";
export type ItemListManagerMapKeys = "PostList" | "Album";
type BlogItemManagerMapValue = BlogItemManagerJa<EntrySkeletonType, BlogItem>;
type ItemListManagerMapValue = ItemListManagerJa<EntrySkeletonType, ItemList<BlogItem>>;

export const BlogItemManagerMap: ReadonlyMap<BlogItemManagerMapKeys, BlogItemManagerMapValue> = new Map<BlogItemManagerMapKeys, BlogItemManagerMapValue>([
  ["BlogPost", new BlogPostManager()],
  ["Song", new SongManager()]
]);

export const ItemListManagerMap: ReadonlyMap<ItemListManagerMapKeys, ItemListManagerMapValue> = new Map<ItemListManagerMapKeys, ItemListManagerMapValue>([
  ["PostList", new PostListManager()],
  ["Album", new AlbumManager()]
]);

type Filter<EntrySkeleton extends EntrySkeletonType> = Omit<EntriesQueries<EntrySkeleton, undefined>, "content_type" | "limit" | "skip">

const tagsCache = new Map<string, Tag>();

export async function getTagWithCache(id: string, client?: ContentfulClientApi<undefined>) {
  if (!client) {
    client = getClient(false);
  }
  if (tagsCache.has(id)) {
    return tagsCache.get(id)!;
  }
  const tag = await client.getTag(id);
  tagsCache.set(id, tag);
  return tag;
}

export interface listNavigatorItem {
  title: string;
  slug: string;
  typeUrl: string;
}

export interface listNavigatorInfo {
  listTitle: string;
  typeUrl: string;
  prev: null | listNavigatorItem;
  next: null | listNavigatorItem;
}
import { unstable_cache } from "next/cache";
import { ContentfulClientApi, EntriesQueries, Entry, EntrySkeletonType, LocaleCode } from "contentful";
import { TypeBlogPost, TypeBlogPostSkeleton, TypeMusicAlbum, TypeMusicAlbumSkeleton, TypePostList, TypePostListSkeleton, TypeSong, TypeSongSkeleton } from "../../@types/contentful";
import { getClient } from "./client";
import { BlogItem, BlogPost, ItemList, PostList, Album, Song } from "./models";

type Filter<EntrySkeleton extends EntrySkeletonType> = Omit<EntriesQueries<EntrySkeleton, undefined>, "content_type" | "limit" | "skip">;

abstract class ContentfulManager<
  EntrySkeleton extends EntrySkeletonType,
  Locales extends LocaleCode,
  DataType
> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<DataType>;

  async query(
    {
      limit = 10,
      page = 0,
      preview = false,
      include,
      filter = {}
    } : {
      limit?: number,
      page?: number,
      preview?: boolean,
      include?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      filter?: Filter<EntrySkeleton>
    }
  ) {
    const client = getClient(preview);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      limit,
      include,
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

  async getBySlug(slug: string, preview = false) {
    const items = await this.query({ filter: { "fields.slug": slug }, preview, limit: 1 });
    if (items.items.length === 0) {
      return null;
    }
    return items.items[0];
  }
}

export abstract class BlogItemManager<
  EntrySkeleton extends EntrySkeletonType,
  Locales extends LocaleCode,
  ItemType extends BlogItem
> extends ContentfulManager<EntrySkeleton, Locales, ItemType> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<ItemType>;

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
> extends ContentfulManager<EntrySkeleton, Locales, ListType> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<ListType>;

  async get(id: string, preview = false) {
    const client = getClient(preview);
    try {
      const entry = await client.getEntry<EntrySkeleton, Locales>(id);
      return this.fromEntry(entry, client);
    } catch {
      return null;
    }
  }
}

export class BlogPostManager extends BlogItemManager<
  TypeBlogPostSkeleton,
  "ja",
  BlogPost
> {
  contentType = "blogPost";
  override async fromEntry(entry: TypeBlogPost<undefined, "ja">, client: ContentfulClientApi<undefined>) : Promise<BlogPost> {
    const { title, slug, body, license, showToc, licenseSelect } = entry.fields;
    const { createdAt, updatedAt } = entry.sys;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    return {
      typeUrl: "articles",
      id: entry.sys.id,
      title,
      slug,
      content: body,
      createdAt,
      updatedAt,
      tags,
      licenseSelect,
      license,
      showToc
    };
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
  override async fromEntry(entry: TypeSong<undefined, "ja">, client: ContentfulClientApi<undefined>) : Promise<Song> {
    const { title, slug, description, artist, releaseDate, credit, lyrics, licenseSelect, license, url, streamUrl } = entry.fields;
    const { createdAt, updatedAt } = entry.sys;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    return {
      typeUrl: "songs",
      id: entry.sys.id,
      title,
      slug,
      content: description ?? "",
      createdAt,
      updatedAt,
      artist,
      credit,
      lyrics,
      releaseDate,
      tags,
      licenseSelect,
      license,
      url,
      streamUrl
    };
  }
}

export class PostListManager extends ItemListManager<
  TypePostListSkeleton,
  "ja",
  PostList
> {
  contentType = "postList";
  override async fromEntry(entry: TypePostList<undefined, "ja">, client: ContentfulClientApi<undefined>) : Promise<PostList> {
    const { title, slug, description } = entry.fields;
    const items = await Promise.all(entry.fields.posts.map((post) => {
      if (!("metadata" in post)) return null;
      return new BlogPostManager().fromEntry(post, client);
    }));
    const nonNullItems = items.filter((item) => item !== null);
    return {
      typeUrl: "lists",
      id: entry.sys.id,
      title,
      slug,
      items: nonNullItems,
      description
    };
  }
}

export class AlbumManager extends ItemListManager<
  TypeMusicAlbumSkeleton,
  "ja",
  Album
> {
  contentType = "musicAlbum";
  override async fromEntry(entry: TypeMusicAlbum<undefined, "ja">, client: ContentfulClientApi<undefined>) : Promise<Album> {
    const { title, slug, description, releaseDate, artist, credit, licenseSelect, license } = entry.fields;
    const tags = await Promise.all(entry.metadata.tags.map((tag) => getTagWithCache(tag.sys.id, client)));
    const items = await Promise.all(entry.fields.tracks.map((song) => {
      if (!("metadata" in song)) return null;
      return new SongManager().fromEntry(song, client);
    }));
    const nonNullItems = items.filter((item) => item !== null);
    return {
      typeUrl: "albums",
      id: entry.sys.id,
      title,
      slug,
      items: nonNullItems,
      description,
      releaseDate,
      artist,
      credit,
      tags,
      licenseSelect,
      license
    };
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
export const isBlogItemManagerMapKeys = (key: string): key is BlogItemManagerMapKeys => {
  return ["BlogPost", "Song"].includes(key);
};
export const isItemListManagerMapKeys = (key: string): key is ItemListManagerMapKeys => {
  return ["PostList", "Album"].includes(key);
};
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

export async function getTagWithCache(tagId: string, client?: ContentfulClientApi<undefined>) {
  if (!client) {
    client = getClient(false);
  }
  return unstable_cache(() => client.getTag(tagId), ["tag", tagId], {
    tags: ["tag"],
    revalidate: 60 * 60, // 1 hour
  })();
}
import { unstable_cache } from "next/cache";
import { ContentfulClientApi, EntriesQueries, Entry, EntrySkeletonType, LocaleCode } from "contentful";
import { TypeBlogPost, TypeBlogPostSkeleton, TypeMusicAlbum, TypeMusicAlbumSkeleton, TypePostList, TypePostListSkeleton, TypeSong, TypeSongSkeleton } from "../../../@types/contentful";
import { getClient } from "./client";
import { Tag, BlogData, BlogPost, PostList, Album, Song } from "@/lib/models";

type Filter<EntrySkeleton extends EntrySkeletonType> = Omit<EntriesQueries<EntrySkeleton, undefined>, "content_type" | "limit" | "skip">;

abstract class BlogDataManager<
  EntrySkeleton extends EntrySkeletonType,
  Locales extends LocaleCode,
  DataType extends BlogData,
> {
  readonly abstract contentType: string;
  abstract fromEntry(entry: Entry<EntrySkeleton, undefined, Locales>, client: ContentfulClientApi<undefined>): Promise<DataType>;

  async get(id: string, preview = false) {
    const client = getClient(preview);
    try {
      const entry = await client.getEntry<EntrySkeleton, Locales>(id);
      return this.fromEntry(entry, client);
    } catch {
      return null;
    }
  }

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

  async getAllSlugs() {
    const client = getClient(false);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      select: ["fields.slug"],
    });
    return entries.items.map((item) => item.fields.slug);
  }

  async getAllIds() {
    const client = getClient(false);
    const entries = await client.getEntries<EntrySkeleton, Locales>({
      content_type: this.contentType,
      select: ["sys.id"],
    });
    return entries.items.map((item) => item.sys.id);
  }
}

export class BlogPostManager extends BlogDataManager<
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
      tagSlugs = [],
      limit = 6
    } : {
      slug: string,
      tagSlugs?: string[],
      limit?: number
    }
  ) {
    return this.query({
      limit,
      filter: {
        "metadata.tags.sys.id[in]": tagSlugs,
        "fields.slug[ne]": slug,
      },
    });
  }
}

export class SongManager extends BlogDataManager<
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

export class PostListManager extends BlogDataManager<
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

export class AlbumManager extends BlogDataManager<
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

export const BlogItemManagerMap = {
  BlogPost: BlogPostManager,
  Song: SongManager
};

export const ItemListManagerMap = {
  PostList: PostListManager,
  Album: AlbumManager
};

export const isBlogItemManagerMapKey = (key: string): key is keyof typeof BlogItemManagerMap => {
  return key in BlogItemManagerMap;
};

export const isItemListManagerMapKey = (key: string): key is keyof typeof ItemListManagerMap => {
  return key in ItemListManagerMap;
};

export async function getAllTags(preview = false, client?: ContentfulClientApi<undefined>) : Promise<Tag[]> {
  if (!client) {
    client = getClient(preview);
  }
  return unstable_cache(async () => {
    const tagCollection = await client.getTags();
    return tagCollection.items.map((tag) => ({
      slug: tag.sys.id,
      name: tag.name
    }));
  }, ["tags"], {
    tags: ["tag"],
    revalidate: 60 * 60 * 24 // 1 day
  })();
}

export async function getTagWithCache(tagSlug: string, client?: ContentfulClientApi<undefined>) : Promise<Tag> {
  if (!client) {
    client = getClient(false);
  }
  return unstable_cache(async () => {
    const tag = await client.getTag(tagSlug);
    return {
      slug: tag.sys.id,
      name: tag.name
    };
  }, ["tag", tagSlug], {
    tags: ["tag"],
    revalidate: 60 * 60 * 24 // 1 day
  })();
}
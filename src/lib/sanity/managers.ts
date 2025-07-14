import { unstable_cache } from "next/cache";
import { getClient } from "./client";
import { Tag, BlogData, BlogPost, PostList, Album, Song } from "@/lib/models";
import { SanityClient, SanityDocument, groq } from "next-sanity";
import type {
  BlogPost as SanityBlogPost,
  Song as SanitySong,
  PostList as SanityPostList,
  MusicAlbum as SanityMusicAlbum,
  Tag as SanityTag,
} from "../../../@types/sanity/sanity.types";
import { ResolveReferences } from "./types";

type SanityBlogPostResolved = ResolveReferences<
  SanityBlogPost, { tags?: SanityTag[]; }
>;

type SanitySongResolved = ResolveReferences<
  SanitySong, { tags?: SanityTag[]; }
>;

type SanityPostListResolved = ResolveReferences<
  SanityPostList,
  {
    posts: SanityBlogPostResolved[];
    tags?: SanityTag[];
  }
>;

type SanityMusicAlbumResolved = ResolveReferences<
  SanityMusicAlbum,
  {
    tracks: SanitySongResolved[];
    tags?: SanityTag[];
  }
>;

const TransformTag = (tag: SanityTag): Tag => ({
  slug: tag.slug.current,
  name: tag.name,
});

abstract class BlogDataManager<DataType extends BlogData> {
  readonly abstract contentType: string;
  readonly abstract additionalResolves: string[];
  abstract fromEntry(entry: SanityDocument<Record<string, unknown>>): Promise<DataType>;

  async get(id: string, preview = false) {
    const client = getClient(preview);
    try {
      const entry = await client.getDocument(id);
      if (!entry) return null;
      return this.fromEntry(entry);
    } catch {
      return null;
    }
  }

  async query(
    {
      limit = 10,
      page = 0,
      preview = false,
      filter = []
    } : {
      limit?: number,
      page?: number,
      preview?: boolean,
      filter?: string[]
    }
  ) {
    const client = getClient(preview);
    const baseCondition = groq`_type == "${this.contentType}"`;
    const fullCondition = filter.length > 0
      ? filter.reduce((acc, curr) => {
        return groq`${acc} && ${curr}`;
      }, baseCondition)
      : baseCondition;
    const additionalResolvesStr = this.additionalResolves.length > 0
      ? this.additionalResolves.join(", ")
      : "";
    const q = groq`{
      "items": *[${fullCondition}]{ ..., "tags": tags[]->, ${additionalResolvesStr} } | order(_createdAt desc) [${page * limit}...${(page + 1) * limit}],
      "total": count(*[${fullCondition}])
    }`;
    const result = await client.fetch<{ items: SanityBlogPostResolved[], total: number }>(q);
    return {
      items: await Promise.all(
        result.items.map((item) => (
          this.fromEntry(item)
        )),
      ),
      total: result.total,
      errors: [],
      limit,
      skip: page * limit,
    };
  }

  async getBySlug(slug: string, preview = false) {
    const items = await this.query({ filter: [groq`slug.current == "${slug}"`], preview, limit: 1 });
    if (items.items.length === 0) {
      return null;
    }
    return items.items[0];
  }

  async getBySlugs(slugs: string[], preview = false, { limit, page }: { limit?: number, page?: number }) {
    const slugsList = slugs.map(s => `"${s}"`).join(", ");
    return this.query({
      filter: [groq`slug.current in [${slugsList}]`],
      preview,
      limit,
      page
    });
  }

  async getAllSlugs() {
    const client = getClient(false);
    const q = groq`*[_type == "${this.contentType}"].slug.current`;
    const slugs = await client.fetch<string[]>(q);
    return slugs.filter(Boolean);
  }

  async getAllIds() {
    const client = getClient(false);
    const q = groq`*[_type == "${this.contentType}"]._id`;
    const ids = await client.fetch<string[]>(q);
    return ids.filter(Boolean);
  }

  async getByTag(tagSlug: string, preview = false, { limit, page }: { limit?: number, page?: number }) {
    return this.query({
      filter: [groq`"${tagSlug}" in tags[]->slug.current`],
      limit,
      page,
      preview
    });
  }

  async getNewest({ page, limit, excludes }: { page?: number, limit?: number, excludes?: string[] }) {
    const excludeList = excludes ? excludes.map(s => `"${s}"`).join(", ") : "";
    return this.query({
      page,
      limit,
      filter: excludes ? [groq`!(slug.current in [${excludeList}])`] : []
    });
  }
}

export class BlogPostManager extends BlogDataManager<BlogPost> {
  contentType = "blogPost";
  additionalResolves = [];
  override async fromEntry(entry: SanityBlogPostResolved): Promise<BlogPost> {
    const { _id, title, slug, body, license, showToc, licenseSelect, tags, _createdAt, _updatedAt } = entry;
    return {
      typeUrl: "articles",
      id: _id,
      title,
      slug: slug.current,
      content: body,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      tags: tags?.map(TransformTag),
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
    const tagList = tagSlugs.map(s => `"${s}"`).join(", ");
    return this.query({
      limit,
      filter: [
        groq`count((tags[]->slug.current)[@ in [${tagList}]]) > 0`,
        groq`slug.current != ${slug}`,
      ],
    });
  }

  async fullTextSearch(query: string, preview = false, { limit, page }: { limit?: number, page?: number } = {}) {
    const queries = query.split(" ").filter(Boolean);
    const queryList = queries.map(q => `"${q}"`).join(", ");
    return this.query({
      filter: [groq`(body match [${queryList}] || title match [${queryList}])`],
      limit,
      page,
      preview
    });
  }
}

export class SongManager extends BlogDataManager<Song> {
  contentType = "song";
  additionalResolves = [];
  override async fromEntry(entry: SanitySongResolved): Promise<Song> {
    const {
      _id, title, slug, description, artist, releaseDate, credit,
      lyrics, licenseSelect, license, url, streamUrl,
      tags, _createdAt, _updatedAt
    } = entry;
    return {
      typeUrl: "songs",
      id: _id,
      title,
      slug: slug.current,
      content: description ?? "",
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      artist,
      credit,
      lyrics,
      releaseDate,
      tags: tags?.map(TransformTag),
      licenseSelect,
      license,
      url,
      streamUrl
    };
  }
}

export class PostListManager extends BlogDataManager<PostList> {
  contentType = "postList";
  additionalResolves = [groq`posts[]->{ ..., "tags": tags[]-> }`];
  override async fromEntry(entry: SanityPostListResolved): Promise<PostList> {
    const { _id, title, slug, description, posts } = entry;
    const items = await Promise.all(
      posts.map((post) => new BlogPostManager().fromEntry(post))
    );
    return {
      typeUrl: "lists",
      id: _id,
      title,
      slug: slug.current,
      items,
      description
    };
  }
}

export class AlbumManager extends BlogDataManager<Album> {
  contentType = "musicAlbum";
  additionalResolves = [groq`tracks[]->{ ..., "tags": tags[]-> }`];
  override async fromEntry(entry: SanityMusicAlbumResolved): Promise<Album> {
    const { _id, title, slug, description, releaseDate, artist, credit, licenseSelect, license, tags } = entry;
    const items = await Promise.all(
      entry.tracks.map((track) => new SongManager().fromEntry(track))
    );
    return {
      typeUrl: "albums",
      id: _id,
      title,
      slug: slug.current,
      items,
      description,
      releaseDate,
      artist,
      credit,
      tags: tags?.map(TransformTag),
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

export async function getAllTags(preview = false, client?: SanityClient) : Promise<Tag[]> {
  if (!client) {
    client = getClient(preview);
  }
  return unstable_cache(async () => {
    const q = groq`*[_type == "tag"]`;
    const tagCollection = await client.fetch<SanityTag[]>(q);
    return tagCollection.map(TransformTag);
  }, ["tags"], {
    tags: ["tag"],
    revalidate: 60 * 60 * 24 // 1 day
  })();
}

export async function getTagWithCache(tagSlug: string, client?: SanityClient) : Promise<Tag | null> {
  if (!client) {
    client = getClient(false);
  }
  return unstable_cache(async () => {
    const q = groq`*[_type == "tag" && slug.current == "${tagSlug}"][0]`;
    const tag = await client.fetch<SanityTag | null>(q);
    if (!tag) return null;
    return TransformTag(tag);
  }, ["tag", tagSlug], {
    tags: ["tag"],
    revalidate: 60 * 60 * 24 // 1 day
  })();
}
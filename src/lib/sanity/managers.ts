import { getClient } from "./client";
import { Tag, BlogData, BlogPost, PostList, Album, Song } from "@/lib/content/types";
import { SanityClient, SanityDocument, groq } from "next-sanity";
import type { Tag as SanityTag } from "../../../@types/sanity/sanity.types";
import type {
  SanityBlogPostResolved,
  SanityMusicAlbumResolved,
  SanityPostListResolved,
  SanitySongResolved,
} from "./types";
import { toAlbum, toBlogPost, toPostList, toSong, toTag } from "./mappers";

abstract class BlogDataManager<DataType extends BlogData> {
  readonly abstract contentType: string;
  readonly abstract additionalResolves: string[];
  abstract fromEntry(entry: SanityDocument<Record<string, unknown>>): Promise<DataType>;

  async get(id: string, preview = false, revalidate = 86400) {
    const client = getClient(preview);
    try {
      const additionalResolvesStr = this.additionalResolves.join(", ");
      const q = groq`*[_id == $id][0]{ ..., "tags": tags[]->, ${additionalResolvesStr} }`;
      const entry = await client.fetch<SanityDocument>(q, { id }, {
        next: {
          tags: [this.contentType, `${this.contentType}:id:${id}`],
          revalidate
        }
      });
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
      filter = [],
      params,
      tags = [],
      revalidate = 86400, // 1 day
    } : {
      limit?: number,
      page?: number,
      preview?: boolean,
      filter?: string[],
      params?: Record<string, unknown>,
      tags?: string[],
      revalidate?: number
    }
  ) {
    const client = getClient(preview);
    const additionalCondition = filter.length > 0 ? filter.join(" && ") : groq`true`;
    const additionalResolvesStr = this.additionalResolves.join(", ");
    const q = groq`{
      "items": *[_type == $contentType && ${additionalCondition}]{ ..., "tags": tags[]->, ${additionalResolvesStr} } | order(_createdAt desc) [$start...$end],
      "total": count(*[_type == $contentType && ${additionalCondition}])
    }`;
    const parameters = {
      contentType: this.contentType,
      start: page * limit,
      end: (page + 1) * limit,
    };
    const paramsWithDefaults = params ? { ...parameters, ...params } : parameters;
    if (process.env.NODE_ENV === "development") {
      console.log("Sanity Query:", q);
      console.log("Parameters:", paramsWithDefaults);
    }
    const result = await client.fetch<{ items: SanityDocument[], total: number }>(q,
      paramsWithDefaults, { next: {
        tags: [this.contentType, ...tags],
        revalidate
      }}
    );
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
    const items = await this.query({
      filter: [groq`slug.current == $slug`],
      params: { slug },
      preview,
      limit: 1,
      tags: [`${this.contentType}:slug:${slug}`],
      revalidate: 86400, // 1 day
    });
    if (items.items.length === 0) {
      return null;
    }
    return items.items[0];
  }

  async getBySlugs(slugs: string[], preview = false, { limit, page }: { limit?: number, page?: number }) {
    return this.query({
      filter: [groq`slug.current in $slugs`],
      params: { slugs },
      preview,
      limit,
      page,
      tags: slugs.map(slug => `${this.contentType}:slug:${slug}`),
      revalidate: 86400, // 1 day
    });
  }

  async getAllSlugs() {
    const client = getClient(false);
    const q = groq`*[_type == $contentType].slug.current`;
    const slugs = await client.fetch<string[]>(q, { contentType: this.contentType }, {
      next: { revalidate: 10 }
    });
    return slugs.filter(Boolean);
  }

  async getAllIds() {
    const client = getClient(false);
    const q = groq`*[_type == $contentType]._id`;
    const ids = await client.fetch<string[]>(q, { contentType: this.contentType }, {
      next: { revalidate: 10 }
    });
    return ids.filter(Boolean);
  }

  async getByTag(tagSlug: string, preview = false, { limit, page }: { limit?: number, page?: number }) {
    return this.query({
      filter: [groq`$tagSlug in tags[]->slug.current`],
      params: { tagSlug },
      limit,
      page,
      preview,
      tags: [`${this.contentType}:tag:${tagSlug}`],
      revalidate: 86400, // 1 day
    });
  }

  async getNewest({ page, limit, excludes = [] }: { page?: number, limit?: number, excludes?: string[] }) {
    // excludesがあれば、そのslugの記事と同時にrevalidate、なければ全体をrevalidate
    const tags = excludes.length > 0 ? excludes.map(slug => `${this.contentType}:slug:${slug}`) : [`${this.contentType}-collection`];
    return this.query({
      page,
      limit,
      filter: excludes.length > 0 ? [groq`!(slug.current in $excludes)`] : [],
      params: { excludes },
      tags,
      revalidate: 86400, // 1 day
    });
  }

  defaultFetcher = this.getBySlug;
}

export class BlogPostManager extends BlogDataManager<BlogPost> {
  contentType = "blogPost";
  additionalResolves = [groq`"image": image.asset->url`];
  override async fromEntry(entry: SanityBlogPostResolved): Promise<BlogPost> {
    return toBlogPost(entry);
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
    const tagSlugsNotEmpty = tagSlugs.filter(Boolean);
    return this.query({
      limit,
      filter: [
        groq`count((tags[]->slug.current)[@ in $tagSlugs]) > 0`,
        groq`slug.current != $slug`,
      ],
      params: { tagSlugs: tagSlugsNotEmpty, slug },
      revalidate: 86400, // 1 day
    });
  }

  async fullTextSearch(query: string, preview = false, { limit, page }: { limit?: number, page?: number } = {}) {
    const queries = query.split(" ").filter(Boolean);
    return this.query({
      filter: [groq`(body match $queries || title match $queries)`],
      params: { queries },
      limit,
      page,
      preview,
      revalidate: 10
    });
  }
}

export class SongManager extends BlogDataManager<Song> {
  contentType = "song";
  additionalResolves = [];
  override async fromEntry(entry: SanitySongResolved): Promise<Song> {
    return toSong(entry);
  }
}

export class PostListManager extends BlogDataManager<PostList> {
  contentType = "postList";
  additionalResolves = [groq`posts[]->{ ..., "tags": tags[]-> }`];
  override async fromEntry(entry: SanityPostListResolved): Promise<PostList> {
    return toPostList(entry);
  }

  async getListsByPost(postSlug: string, preview = false) {
    const client = getClient(preview);
    const q = groq`*[_type == "postList" && $postSlug in posts[]->slug.current]{
      ...,
      "posts": posts[]->{ ..., "tags": tags[]-> }
    }`;
    const lists = await client.fetch<SanityPostListResolved[]>(q, { postSlug }, {
      next: { revalidate: 10 }
    });
    return Promise.all(lists.map((list) => new PostListManager().fromEntry(list)));
  }

  defaultFetcher = this.get;
}

export class AlbumManager extends BlogDataManager<Album> {
  contentType = "musicAlbum";
  additionalResolves = [groq`tracks[]->{ ..., "tags": tags[]-> }`];
  override async fromEntry(entry: SanityMusicAlbumResolved): Promise<Album> {
    return toAlbum(entry);
  }

  async getAlbumsBySong(songSlug: string, preview = false) {
    const client = getClient(preview);
    const q = groq`*[_type == "musicAlbum" && $songSlug in tracks[]->slug.current]{
      ...,
      "tracks": tracks[]->{ ..., "tags": tags[]-> }
    }`;
    const lists = await client.fetch<SanityMusicAlbumResolved[]>(q, { songSlug }, {
      next: { revalidate: 10 }
    });
    return Promise.all(lists.map((list) => new AlbumManager().fromEntry(list)));
  }
}

export async function getAllTags(preview = false, client?: SanityClient) : Promise<Tag[]> {
  if (!client) {
    client = getClient(preview);
  }
  const q = groq`*[_type == "tag"]`;
  const tagCollection = await client.fetch<SanityTag[]>(q, {
    tags: ["tags", "tags-collection"],
    revalidate: 86400 // 1 day
  });
  return tagCollection.map(toTag);
}

export async function getTagWithCache(tagSlug: string, client?: SanityClient) : Promise<Tag | null> {
  if (!client) {
    client = getClient(false);
  }
  const q = groq`*[_type == "tag" && slug.current == $tagSlug][0]`;
  const tag = await client.fetch<SanityTag | null>(q, { tagSlug }, {
    next: {
      tags: ["tags", `tags:slug:${tagSlug}`],
      revalidate: 86400 // 1 day
    }
  });
  return tag ? toTag(tag) : null;
}
import { ContentfulClientApi, createClient, EntriesQueries, Entry, EntrySkeletonType, LocaleCode, Tag } from "contentful";
import { TypeBlogPost, TypeBlogPostSkeleton, TypeMusicAlbum, TypeMusicAlbumSkeleton, TypePostList, TypePostListSkeleton, TypeSong, TypeSongSkeleton, TypeGlobalSettingsSkeleton, TypeLinkListSkeleton } from "../../@types/contentful";
import { LicenseType } from "@/lib/licenses";
import { unstable_cache } from "next/cache";

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

interface LinkItem {
  href: string;
  name: string;
}

export interface GlobalSettings {
  siteName: string;
  description: string;
  author: string;
  authorUrl?: string;
  copyright: string;
  donate?: string;
  donateUrl?: string;
  bio: string;
  contactUrl?: string;
  useSidebar: boolean;
  adblock: boolean;
  showRelatedPosts: boolean;
  showNewPosts: boolean;
  recommendedPosts: string[];
  socials: LinkItem[];
  navbarPages: LinkItem[];
  footerPages: LinkItem[];
  avatar?: string;
  topLogo?: string;
  banner?: string;
  favicon: string;
  appleTouchIcon: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  licenseSelect?: LicenseType;
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

export interface BlogPost extends BlogItem {
  typeUrl: "articles",
  id: string,
  title: string,
  slug: string,
  content: string,
  createdAt: string,
  updatedAt: string,
  tags?: Tag[],
  licenseSelect?: LicenseType,
  license?: string,
  showToc?: boolean
}

export interface Song extends BlogItem {
  typeUrl: "songs";
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  artist: string[];
  credit?: string[];
  lyrics?: string;
  releaseDate?: string;
  tags?: Tag[];
  licenseSelect?: LicenseType;
  license?: string;
  url?: string[];
  streamUrl?: string;
}

export interface PostList extends ItemList<BlogPost> {
  typeUrl: "lists";
  id: string,
  title: string,
  slug: string,
  items: BlogPost[],
  description?: string
}

export interface Album extends ItemList<Song> {
  typeUrl: "albums";
  id: string;
  title: string;
  slug: string;
  items: Song[];
  description?: string;
  releaseDate?: string;
  artist?: string[];
  credit?: string[];
  tags?: Tag[];
  licenseSelect?: LicenseType;
  license?: string;
}

export const loadGlobalSettings = unstable_cache(fetchGlobalSettings, ["globalSettings"], {
  tags: ["globalSettings"],
  revalidate: 60 * 60, // 1 hour
});

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  const client = getClient(false);
  const gsEntries = await client.getEntries<TypeGlobalSettingsSkeleton>({
    content_type: "globalSettings",
    limit: 1,
    include: 1,
  });
  const entry = gsEntries.items[0];
  const fields = entry.fields;
  const includesAssets = gsEntries.includes?.Asset ?? [];
  const avatarId = fields.avatar?.sys.id;
  const topLogoId = fields.topLogo?.sys.id;
  const bannerId = fields.banner?.sys.id;
  const faviconId = fields.favicon?.sys.id;
  const appleTouchIconId = fields.appleTouchIcon?.sys.id;

  const llEntries = await client.getEntries<TypeLinkListSkeleton>({
    content_type: "linkList",
    "fields.id[in]": ["socials", "navbarPages", "footerPages"],
  });
  const llIncludes = llEntries.includes?.Entry ?? [];
  const socialsEntry = llEntries.items.find(item => item.fields.id === "socials");
  const navbarPagesEntry = llEntries.items.find(item => item.fields.id === "navbarPages");
  const footerPagesEntry = llEntries.items.find(item => item.fields.id === "footerPages");

  const toHrefItem = (id: string) => {
    const item = llIncludes.find(item => item.sys.id === id);
    return {
      name: item?.fields.name,
      href: item?.fields.href
    } as LinkItem;
  };

  const avatarUrl = includesAssets.find(asset => asset.sys.id === avatarId)?.fields.file?.url;
  const topLogoUrl = includesAssets.find(asset => asset.sys.id === topLogoId)?.fields.file?.url;
  const bannerUrl = includesAssets.find(asset => asset.sys.id === bannerId)?.fields.file?.url;
  const faviconUrl = includesAssets.find(asset => asset.sys.id === faviconId)?.fields.file?.url;
  const appleTouchIconUrl = includesAssets.find(asset => asset.sys.id === appleTouchIconId)?.fields.file?.url;

  return {
    siteName: fields.siteName,
    description: fields.description ?? "",
    author: fields.author,
    authorUrl: fields.authorUrl,
    copyright: fields.copyright ?? "Copyright © " + new Date().getFullYear() + " " + fields.author,
    donate: fields.donate,
    donateUrl: fields.donateUrl,
    bio: fields.bio ?? "",
    contactUrl: fields.contactUrl,
    useSidebar: fields.useSidebar,
    adblock: fields.adblock,
    showRelatedPosts: fields.showRelatedPosts,
    showNewPosts: fields.showNewPosts,
    recommendedPosts: fields.recommendedPosts ?? [],
    socials: socialsEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    navbarPages: navbarPagesEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    footerPages: footerPagesEntry?.fields.item.map(item => toHrefItem(item.sys.id)) ?? [],
    avatar: "https:" + avatarUrl,
    topLogo: "https:" + topLogoUrl,
    banner: "https:" + bannerUrl,
    favicon: "https:" + faviconUrl,
    appleTouchIcon: "https:" + appleTouchIconUrl,
  };
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

type Filter<EntrySkeleton extends EntrySkeletonType> = Omit<EntriesQueries<EntrySkeleton, undefined>, "content_type" | "limit" | "skip">;

export async function getTagWithCache(tagId: string, client?: ContentfulClientApi<undefined>) {
  if (!client) {
    client = getClient(false);
  }
  return unstable_cache(() => client.getTag(tagId), ["tag", tagId], {
    tags: ["tag"],
    revalidate: 60 * 60, // 1 hour
  })();
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
import type {
  BlogPost as SanityBlogPost,
  Song as SanitySong,
  PostList as SanityPostList,
  MusicAlbum as SanityMusicAlbum,
  Tag as SanityTag,
} from "../../../@types/sanity/sanity.types";

/**
 * 参照を解決するユーティリティ型
 * @template T - 元の型
 * @template R - { key: NewType }形式で、参照を解決したいフィールドとその型を指定
 */
export type ResolveReferences<T, R extends { [K in keyof T]?: unknown }> = Omit<T, keyof R> & R;

export type SanityBlogPostResolved = ResolveReferences<
  SanityBlogPost, { tags?: (SanityTag | null)[], image?: string; }
>;

export type SanitySongResolved = ResolveReferences<
  SanitySong, { tags?: (SanityTag | null)[]; }
>;

export type SanityPostListResolved = ResolveReferences<
  SanityPostList,
  {
    posts: SanityBlogPostResolved[];
    tags?: (SanityTag | null)[];
  }
>;

export type SanityMusicAlbumResolved = ResolveReferences<
  SanityMusicAlbum,
  {
    tracks: SanitySongResolved[];
    tags?: (SanityTag | null)[];
  }
>;

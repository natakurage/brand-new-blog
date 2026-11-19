import { defineQuery } from "next-sanity";

/*
 * GROQ のクエリ。条件はすべてパラメータで渡し、文字列を組み立てない。
 * 省略できる条件は null を渡すと無効になる（GROQ は未定義のパラメータを参照するとエラーになるため）。
 * ページ送りは $start（含む）と $end（含まない）で指定する。
 */

// 射影（取得するフィールドと参照の解決）
const articleProjection = /* groq */ `{ ..., "tags": tags[]->, "image": image.asset->url }`;
const songProjection = /* groq */ `{ ..., "tags": tags[]-> }`;
const postListProjection = /* groq */ `{ ..., "tags": tags[]->, "posts": posts[]->${articleProjection} }`;
const albumProjection = /* groq */ `{ ..., "tags": tags[]->, "tracks": tracks[]->${songProjection} }`;
// 一覧用：中身（posts / tracks）を取得しない
const collectionSummaryProjection = /* groq */ `{ ..., "tags": tags[]-> }`;

// 記事

const articleFilter = /* groq */ `_type == "blogPost"
  && ($tagSlug == null || $tagSlug in tags[]->slug.current)
  && ($slugs == null || slug.current in $slugs)
  && !(slug.current in coalesce($exclude, []))`;

export const articleBySlugQuery = defineQuery(`*[_type == "blogPost" && slug.current == $slug][0]${articleProjection}`);

export const articleListQuery = defineQuery(`{
  "items": *[${articleFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleFilter}])
}`);

export const relatedArticlesQuery = defineQuery(`*[_type == "blogPost" && slug.current != $slug && count((tags[]->slug.current)[@ in $tagSlugs]) > 0]
    | order(_createdAt desc) [0...$limit]${articleProjection}`);

const articleSearchFilter = /* groq */ `_type == "blogPost" && (body match $terms || title match $terms)`;

export const articleSearchQuery = defineQuery(`{
  "items": *[${articleSearchFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleSearchFilter}])
}`);

export const articleSlugsQuery = defineQuery(`*[_type == "blogPost" && defined(slug.current)].slug.current`);

// 曲

export const songBySlugQuery = defineQuery(`*[_type == "song" && slug.current == $slug][0]${songProjection}`);

export const songListQuery = defineQuery(`{
  "items": *[_type == "song"] | order(_createdAt desc) [$start...$end]${songProjection},
  "total": count(*[_type == "song"])
}`);

export const songSlugsQuery = defineQuery(`*[_type == "song" && defined(slug.current)].slug.current`);

// 記事リスト

export const postListBySlugQuery = defineQuery(`*[_type == "postList" && slug.current == $slug][0]${postListProjection}`);

export const postListListQuery = defineQuery(`{
  "items": *[_type == "postList"] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "postList"])
}`);

export const postListsContainingQuery = defineQuery(`*[_type == "postList" && $articleSlug in posts[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const postListSlugsQuery = defineQuery(`*[_type == "postList" && defined(slug.current)].slug.current`);

// アルバム

export const albumBySlugQuery = defineQuery(`*[_type == "musicAlbum" && slug.current == $slug][0]${albumProjection}`);

export const albumListQuery = defineQuery(`{
  "items": *[_type == "musicAlbum"] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "musicAlbum"])
}`);

export const albumsContainingQuery = defineQuery(`*[_type == "musicAlbum" && $songSlug in tracks[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const albumSlugsQuery = defineQuery(`*[_type == "musicAlbum" && defined(slug.current)].slug.current`);

// タグ

export const tagBySlugQuery = defineQuery(`*[_type == "tag" && slug.current == $slug][0]`);

export const tagSlugsQuery = defineQuery(`*[_type == "tag" && defined(slug.current)].slug.current`);

// サイト設定

export const siteSettingsQuery = defineQuery(`*[_type == "globalSettings"][0]{
  ...,
  "avatar": avatar.asset->url,
  "topLogo": topLogo.asset->url,
  "banner": banner.asset->url,
  "favicon": favicon.asset->url,
  "appleTouchIcon": appleTouchIcon.asset->url
}`);

export const linkListsQuery = defineQuery(`*[_type == "linkList" && id.current in $ids]{ ..., "item": item[]-> }`);

import { defineQuery } from "next-sanity";

// 省略する条件には null を渡す（GROQ は渡されていないパラメータを参照するとエラーになる）
// slug のない文書は存在しないものとして扱う。参照は辿る前に絞る（辿った後の [条件] は配列でなく各要素に掛かる）

const hasSlug = /* groq */ `defined(slug.current)`;
const refHasSlug = /* groq */ `defined(@->slug.current)`;

const articleProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "image": image.asset->url }`;
const songProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]-> }`;
const postListProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "posts": posts[${refHasSlug}]->${articleProjection} }`;
const albumProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "tracks": tracks[${refHasSlug}]->${songProjection} }`;
const collectionSummaryProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]-> }`;

const articleFilter = /* groq */ `_type == "blogPost" && ${hasSlug}
  && ($tagSlug == null || $tagSlug in tags[]->slug.current)
  && ($slugs == null || slug.current in $slugs)
  && !(slug.current in coalesce($exclude, []))`;

export const articleBySlugQuery = defineQuery(`*[_type == "blogPost" && slug.current == $slug][0]${articleProjection}`);

export const articleListQuery = defineQuery(`{
  "items": *[${articleFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleFilter}])
}`);

export const relatedArticlesQuery = defineQuery(`*[_type == "blogPost" && ${hasSlug} && slug.current != $slug && count((tags[]->slug.current)[@ in $tagSlugs]) > 0]
    | order(_createdAt desc) [0...$limit]${articleProjection}`);

const articleSearchFilter = /* groq */ `_type == "blogPost" && ${hasSlug} && (body match $terms || title match $terms)`;

export const articleSearchQuery = defineQuery(`{
  "items": *[${articleSearchFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleSearchFilter}])
}`);

export const articleSlugsQuery = defineQuery(`*[_type == "blogPost" && ${hasSlug}].slug.current`);

export const songBySlugQuery = defineQuery(`*[_type == "song" && slug.current == $slug][0]${songProjection}`);

export const songListQuery = defineQuery(`{
  "items": *[_type == "song" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${songProjection},
  "total": count(*[_type == "song" && ${hasSlug}])
}`);

export const songSlugsQuery = defineQuery(`*[_type == "song" && ${hasSlug}].slug.current`);

export const postListBySlugQuery = defineQuery(`*[_type == "postList" && slug.current == $slug][0]${postListProjection}`);

export const postListListQuery = defineQuery(`{
  "items": *[_type == "postList" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "postList" && ${hasSlug}])
}`);

export const postListsContainingQuery = defineQuery(`*[_type == "postList" && ${hasSlug} && $articleSlug in posts[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const postListSlugsQuery = defineQuery(`*[_type == "postList" && ${hasSlug}].slug.current`);

export const albumBySlugQuery = defineQuery(`*[_type == "musicAlbum" && slug.current == $slug][0]${albumProjection}`);

export const albumListQuery = defineQuery(`{
  "items": *[_type == "musicAlbum" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "musicAlbum" && ${hasSlug}])
}`);

export const albumsContainingQuery = defineQuery(`*[_type == "musicAlbum" && ${hasSlug} && $songSlug in tracks[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const albumSlugsQuery = defineQuery(`*[_type == "musicAlbum" && ${hasSlug}].slug.current`);

export const tagBySlugQuery = defineQuery(`*[_type == "tag" && slug.current == $slug][0]`);

export const tagSlugsQuery = defineQuery(`*[_type == "tag" && ${hasSlug}].slug.current`);

export const siteSettingsQuery = defineQuery(`*[_type == "globalSettings"][0]{
  ...,
  "avatar": avatar.asset->url,
  "topLogo": topLogo.asset->url,
  "banner": banner.asset->url,
  "favicon": favicon.asset->url,
  "appleTouchIcon": appleTouchIcon.asset->url
}`);

export const linkListsQuery = defineQuery(`*[_type == "linkList" && id.current in $ids]{ ..., "item": item[]-> }`);

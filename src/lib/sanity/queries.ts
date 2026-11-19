import { defineQuery } from "next-sanity";

// 省略する条件には null を渡す（GROQ は渡されていないパラメータを参照するとエラーになる）

const articleProjection = /* groq */ `{ ..., "tags": tags[]->, "image": image.asset->url }`;
const songProjection = /* groq */ `{ ..., "tags": tags[]-> }`;
const postListProjection = /* groq */ `{ ..., "tags": tags[]->, "posts": posts[]->${articleProjection} }`;
const albumProjection = /* groq */ `{ ..., "tags": tags[]->, "tracks": tracks[]->${songProjection} }`;
const collectionSummaryProjection = /* groq */ `{ ..., "tags": tags[]-> }`;

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

export const songBySlugQuery = defineQuery(`*[_type == "song" && slug.current == $slug][0]${songProjection}`);

export const songListQuery = defineQuery(`{
  "items": *[_type == "song"] | order(_createdAt desc) [$start...$end]${songProjection},
  "total": count(*[_type == "song"])
}`);

export const songSlugsQuery = defineQuery(`*[_type == "song" && defined(slug.current)].slug.current`);

export const postListBySlugQuery = defineQuery(`*[_type == "postList" && slug.current == $slug][0]${postListProjection}`);

export const postListListQuery = defineQuery(`{
  "items": *[_type == "postList"] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "postList"])
}`);

export const postListsContainingQuery = defineQuery(`*[_type == "postList" && $articleSlug in posts[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const postListSlugsQuery = defineQuery(`*[_type == "postList" && defined(slug.current)].slug.current`);

export const albumBySlugQuery = defineQuery(`*[_type == "musicAlbum" && slug.current == $slug][0]${albumProjection}`);

export const albumListQuery = defineQuery(`{
  "items": *[_type == "musicAlbum"] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "musicAlbum"])
}`);

export const albumsContainingQuery = defineQuery(`*[_type == "musicAlbum" && $songSlug in tracks[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const albumSlugsQuery = defineQuery(`*[_type == "musicAlbum" && defined(slug.current)].slug.current`);

export const tagBySlugQuery = defineQuery(`*[_type == "tag" && slug.current == $slug][0]`);

export const tagSlugsQuery = defineQuery(`*[_type == "tag" && defined(slug.current)].slug.current`);

export const siteSettingsQuery = defineQuery(`*[_type == "globalSettings"][0]{
  ...,
  "avatar": avatar.asset->url,
  "topLogo": topLogo.asset->url,
  "banner": banner.asset->url,
  "favicon": favicon.asset->url,
  "appleTouchIcon": appleTouchIcon.asset->url
}`);

export const linkListsQuery = defineQuery(`*[_type == "linkList" && id.current in $ids]{ ..., "item": item[]-> }`);

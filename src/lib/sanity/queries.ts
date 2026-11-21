import { defineQuery } from "next-sanity";
import { sanityTypeOf } from "./kinds";

// 省略する条件には null を渡す（GROQ は渡されていないパラメータを参照するとエラーになる）
// slug のない文書は存在しないものとして扱う。参照は辿る前に絞る（辿った後の [条件] は配列でなく各要素に掛かる）

const hasSlug = /* groq */ `defined(slug.current)`;
const refHasSlug = /* groq */ `defined(@->slug.current)`;

const articleProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "image": image.asset->url }`;
const songProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]-> }`;
const postListProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "posts": posts[${refHasSlug}]->${articleProjection} }`;
const albumProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]->, "tracks": tracks[${refHasSlug}]->${songProjection} }`;
// 識別子だけ。一覧の全件を本文なしで取るときに使う
const addressProjection = /* groq */ `{ _type, "slug": slug.current }`;
const collectionSummaryProjection = /* groq */ `{ ..., "tags": tags[${refHasSlug}]-> }`;

const articleFilter = /* groq */ `_type == "${sanityTypeOf.article}" && ${hasSlug}
  && ($slugs == null || slug.current in $slugs)
  && !(slug.current in coalesce($exclude, []))`;

export const articleBySlugQuery = defineQuery(`*[_type == "${sanityTypeOf.article}" && slug.current == $slug][0]${articleProjection}`);

export const articleListQuery = defineQuery(`{
  "items": *[${articleFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleFilter}])
}`);

export const relatedArticlesQuery = defineQuery(`*[_type == "${sanityTypeOf.article}" && ${hasSlug} && slug.current != $slug && count((tags[]->slug.current)[@ in $tagSlugs]) > 0]
    | order(_createdAt desc) [0...$limit]${articleProjection}`);

const articleSearchFilter = /* groq */ `_type == "${sanityTypeOf.article}" && ${hasSlug} && (body match $terms || title match $terms)`;

export const articleAddressesQuery = defineQuery(`*[${articleFilter}] | order(_createdAt desc)${addressProjection}`);

export const articleSearchAddressesQuery = defineQuery(`*[${articleSearchFilter}] | order(_createdAt desc)${addressProjection}`);

export const articleSearchQuery = defineQuery(`{
  "items": *[${articleSearchFilter}] | order(_createdAt desc) [$start...$end]${articleProjection},
  "total": count(*[${articleSearchFilter}])
}`);

export const articleSlugsQuery = defineQuery(`*[_type == "${sanityTypeOf.article}" && ${hasSlug}].slug.current`);

export const songBySlugQuery = defineQuery(`*[_type == "${sanityTypeOf.song}" && slug.current == $slug][0]${songProjection}`);

export const songListQuery = defineQuery(`{
  "items": *[_type == "${sanityTypeOf.song}" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${songProjection},
  "total": count(*[_type == "${sanityTypeOf.song}" && ${hasSlug}])
}`);

export const songAddressesQuery = defineQuery(`*[_type == "${sanityTypeOf.song}" && ${hasSlug}] | order(_createdAt desc)${addressProjection}`);

export const songSlugsQuery = defineQuery(`*[_type == "${sanityTypeOf.song}" && ${hasSlug}].slug.current`);

export const postListBySlugQuery = defineQuery(`*[_type == "${sanityTypeOf.postList}" && slug.current == $slug][0]${postListProjection}`);

export const postListListQuery = defineQuery(`{
  "items": *[_type == "${sanityTypeOf.postList}" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "${sanityTypeOf.postList}" && ${hasSlug}])
}`);

export const postListsContainingQuery = defineQuery(`*[_type == "${sanityTypeOf.postList}" && ${hasSlug} && $articleSlug in posts[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const postListSlugsQuery = defineQuery(`*[_type == "${sanityTypeOf.postList}" && ${hasSlug}].slug.current`);

export const albumBySlugQuery = defineQuery(`*[_type == "${sanityTypeOf.album}" && slug.current == $slug][0]${albumProjection}`);

export const albumListQuery = defineQuery(`{
  "items": *[_type == "${sanityTypeOf.album}" && ${hasSlug}] | order(_createdAt desc) [$start...$end]${collectionSummaryProjection},
  "total": count(*[_type == "${sanityTypeOf.album}" && ${hasSlug}])
}`);

export const albumsContainingQuery = defineQuery(`*[_type == "${sanityTypeOf.album}" && ${hasSlug} && $songSlug in tracks[]->slug.current] | order(_createdAt desc)${collectionSummaryProjection}`);

export const albumSlugsQuery = defineQuery(`*[_type == "${sanityTypeOf.album}" && ${hasSlug}].slug.current`);

export const tagBySlugQuery = defineQuery(`*[_type == "${sanityTypeOf.tag}" && slug.current == $slug][0]`);

export const tagSlugsQuery = defineQuery(`*[_type == "${sanityTypeOf.tag}" && ${hasSlug}].slug.current`);

// タグを持つ文書の型は問わない（どの型の文書でも、そのタグを参照していれば含める）
const taggedFilter = /* groq */ `${hasSlug} && $tagSlug in tags[]->slug.current`;

export const taggedListQuery = defineQuery(`{
  "items": *[${taggedFilter}] | order(_createdAt desc) [$start...$end]{
    ...,
    "tags": tags[${refHasSlug}]->,
    _type == "${sanityTypeOf.article}" => { "image": image.asset->url }
  },
  "total": count(*[${taggedFilter}])
}`);

export const siteSettingsQuery = defineQuery(`*[_type == "globalSettings"][0]{
  ...,
  "avatar": avatar.asset->url,
  "topLogo": topLogo.asset->url,
  "banner": banner.asset->url,
  "favicon": favicon.asset->url,
  "appleTouchIcon": appleTouchIcon.asset->url
}`);

export const linkListsQuery = defineQuery(`*[_type == "linkList" && id.current in $ids]{ ..., "item": item[]-> }`);

export const taggedAddressesQuery = defineQuery(`*[${taggedFilter}] | order(_createdAt desc)${addressProjection}`);

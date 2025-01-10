import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeBlogPostFields {
    title: EntryFieldTypes.Symbol;
    image?: EntryFieldTypes.AssetLink;
    slug: EntryFieldTypes.Symbol;
    showToc: EntryFieldTypes.Boolean;
    body: EntryFieldTypes.Text;
    license: EntryFieldTypes.Text;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<TypeBlogPostFields, "blogPost">;
export type TypeBlogPost<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeBlogPostSkeleton, Modifiers, Locales>;
export type TypeBlogPostWithoutLinkResolutionResponse = TypeBlogPost<"WITHOUT_LINK_RESOLUTION">;
export type TypeBlogPostWithoutUnresolvableLinksResponse = TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeBlogPostWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITH_ALL_LOCALES", Locales>;
export type TypeBlogPostWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeBlogPostWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

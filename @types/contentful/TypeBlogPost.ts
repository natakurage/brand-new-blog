import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeBlogPostFields {
    title: EntryFieldTypes.Symbol;
    image?: EntryFieldTypes.AssetLink;
    slug: EntryFieldTypes.Symbol;
    showToc: EntryFieldTypes.Boolean;
    body: EntryFieldTypes.Text;
    licenseSelect?: EntryFieldTypes.Symbol<"CC BY 4.0" | "CC BY-NC 4.0" | "CC BY-NC-ND 4.0" | "CC BY-NC-SA 4.0" | "CC BY-ND 4.0" | "CC BY-SA 4.0" | "CC0 1.0">;
    license: EntryFieldTypes.Text;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<TypeBlogPostFields, "blogPost">;
export type TypeBlogPost<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeBlogPostSkeleton, Modifiers, Locales>;
export type TypeBlogPostWithoutLinkResolutionResponse = TypeBlogPost<"WITHOUT_LINK_RESOLUTION">;
export type TypeBlogPostWithoutUnresolvableLinksResponse = TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeBlogPostWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITH_ALL_LOCALES", Locales>;
export type TypeBlogPostWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeBlogPostWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeBlogPost<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

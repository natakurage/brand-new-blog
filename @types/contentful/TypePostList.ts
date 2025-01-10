import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeBlogPostSkeleton } from "./TypeBlogPost";

export interface TypePostListFields {
    title: EntryFieldTypes.Symbol;
    posts: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeBlogPostSkeleton>>;
    description?: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Symbol;
}

export type TypePostListSkeleton = EntrySkeletonType<TypePostListFields, "postList">;
export type TypePostList<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePostListSkeleton, Modifiers, Locales>;
export type TypePostListWithoutLinkResolutionResponse = TypePostList<"WITHOUT_LINK_RESOLUTION">;
export type TypePostListWithoutUnresolvableLinksResponse = TypePostList<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypePostListWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypePostList<"WITH_ALL_LOCALES", Locales>;
export type TypePostListWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypePostList<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypePostListWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypePostList<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeLinkItemSkeleton } from "./TypeLinkItem";

export interface TypeLinkListFields {
    id: EntryFieldTypes.Symbol;
    item: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeLinkItemSkeleton>>;
}

export type TypeLinkListSkeleton = EntrySkeletonType<TypeLinkListFields, "linkList">;
export type TypeLinkList<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeLinkListSkeleton, Modifiers, Locales>;
export type TypeLinkListWithoutLinkResolutionResponse = TypeLinkList<"WITHOUT_LINK_RESOLUTION">;
export type TypeLinkListWithoutUnresolvableLinksResponse = TypeLinkList<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeLinkListWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkList<"WITH_ALL_LOCALES", Locales>;
export type TypeLinkListWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkList<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeLinkListWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkList<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

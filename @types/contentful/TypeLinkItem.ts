import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeLinkItemFields {
    name: EntryFieldTypes.Symbol;
    href: EntryFieldTypes.Symbol;
}

export type TypeLinkItemSkeleton = EntrySkeletonType<TypeLinkItemFields, "linkItem">;
export type TypeLinkItem<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeLinkItemSkeleton, Modifiers, Locales>;
export type TypeLinkItemWithoutLinkResolutionResponse = TypeLinkItem<"WITHOUT_LINK_RESOLUTION">;
export type TypeLinkItemWithoutUnresolvableLinksResponse = TypeLinkItem<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeLinkItemWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkItem<"WITH_ALL_LOCALES", Locales>;
export type TypeLinkItemWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkItem<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeLinkItemWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeLinkItem<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

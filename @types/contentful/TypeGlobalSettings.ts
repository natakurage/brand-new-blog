import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeGlobalSettingsFields {
    siteName: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Text;
    author: EntryFieldTypes.Symbol;
    authorUrl?: EntryFieldTypes.Symbol;
    copyright?: EntryFieldTypes.Symbol;
    donate?: EntryFieldTypes.Symbol;
    donateUrl?: EntryFieldTypes.Symbol;
    bio?: EntryFieldTypes.Text;
    contactUrl?: EntryFieldTypes.Symbol;
    useSidebar: EntryFieldTypes.Boolean;
    adblock: EntryFieldTypes.Boolean;
    showRelatedPosts: EntryFieldTypes.Boolean;
    showNewPosts: EntryFieldTypes.Boolean;
    recommendedPosts?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    socials?: EntryFieldTypes.Object;
    navbarPages?: EntryFieldTypes.Object;
    footerPages?: EntryFieldTypes.Object;
    avatar?: EntryFieldTypes.AssetLink;
    topLogo?: EntryFieldTypes.AssetLink;
    banner?: EntryFieldTypes.AssetLink;
    favicon: EntryFieldTypes.AssetLink;
    appleTouchIcon: EntryFieldTypes.AssetLink;
}

export type TypeGlobalSettingsSkeleton = EntrySkeletonType<TypeGlobalSettingsFields, "globalSettings">;
export type TypeGlobalSettings<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeGlobalSettingsSkeleton, Modifiers, Locales>;
export type TypeGlobalSettingsWithoutLinkResolutionResponse = TypeGlobalSettings<"WITHOUT_LINK_RESOLUTION">;
export type TypeGlobalSettingsWithoutUnresolvableLinksResponse = TypeGlobalSettings<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeGlobalSettingsWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeGlobalSettings<"WITH_ALL_LOCALES", Locales>;
export type TypeGlobalSettingsWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeGlobalSettings<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeGlobalSettingsWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeGlobalSettings<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

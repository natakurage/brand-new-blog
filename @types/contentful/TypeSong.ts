import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeSongFields {
    title: EntryFieldTypes.Symbol;
    artist: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    releaseDate?: EntryFieldTypes.Date;
    slug: EntryFieldTypes.Symbol;
    credit?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    url?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    description?: EntryFieldTypes.Text;
    lyrics?: EntryFieldTypes.Text;
    license: EntryFieldTypes.Text;
}

export type TypeSongSkeleton = EntrySkeletonType<TypeSongFields, "song">;
export type TypeSong<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeSongSkeleton, Modifiers, Locales>;
export type TypeSongWithoutLinkResolutionResponse = TypeSong<"WITHOUT_LINK_RESOLUTION">;
export type TypeSongWithoutUnresolvableLinksResponse = TypeSong<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeSongWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeSong<"WITH_ALL_LOCALES", Locales>;
export type TypeSongWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeSong<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeSongWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeSong<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

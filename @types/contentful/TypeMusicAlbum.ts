import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeSongSkeleton } from "./TypeSong";

export interface TypeMusicAlbumFields {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Text;
    tracks: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeSongSkeleton>>;
    releaseDate?: EntryFieldTypes.Date;
    artist?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    credit?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    license?: EntryFieldTypes.Text;
}

export type TypeMusicAlbumSkeleton = EntrySkeletonType<TypeMusicAlbumFields, "musicAlbum">;
export type TypeMusicAlbum<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeMusicAlbumSkeleton, Modifiers, Locales>;
export type TypeMusicAlbumWithoutLinkResolutionResponse = TypeMusicAlbum<"WITHOUT_LINK_RESOLUTION">;
export type TypeMusicAlbumWithoutUnresolvableLinksResponse = TypeMusicAlbum<"WITHOUT_UNRESOLVABLE_LINKS">;
export type TypeMusicAlbumWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeMusicAlbum<"WITH_ALL_LOCALES", Locales>;
export type TypeMusicAlbumWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeMusicAlbum<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
export type TypeMusicAlbumWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeMusicAlbum<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;

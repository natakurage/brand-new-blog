import type { BlogPost, Song } from "./types";
import { absoluteUrlOf } from "./href";
import { licenseLabel } from "./license";
import type { Calendar } from "./date";

const field = (key: string, value: string): string => `${key}: ${value}`;

const toList = (lines: string[]): string => lines.map((line) => `- ${line}`).join("\n");

export const getCreditText = (item: BlogPost, author: string, origin: string, calendar: Calendar): string => {
  return toList([
    field("タイトル", item.title),
    field("著者", author),
    field("作成年", calendar.year(item.createdAt).toString()),
    field("URL", absoluteUrlOf(item, origin)),
    field("ライセンス", licenseLabel(item.license)),
  ]);
};

// credit は自由記述の行なので、ページの表示と同じくそのまま並べる
export const getSongCreditText = (song: Song, origin: string, calendar: Calendar): string => {
  return toList([
    field("タイトル", song.title),
    field("アーティスト", song.artist.join(", ")),
    ...song.credit,
    field("作成年", calendar.year(song.createdAt).toString()),
    field("URL", absoluteUrlOf(song, origin)),
    field("ライセンス", licenseLabel(song.license)),
  ]);
};

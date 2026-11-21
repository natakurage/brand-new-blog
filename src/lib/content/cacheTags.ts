import type { Addressable } from "./href";
import type { CollectionSummary, Content, ItemSummary, Kind, Tag } from "./types";

// キャッシュの無効化に使う名前。結果に含まれる文書ごとのタグと、どの文書が含まれるかが変わりうる結果に付ける種類ごとのタグがある

export const kindTag = (kind: Kind): string => kind;

export const documentTag = ({ kind, slug }: Addressable): string => `${kind}:${slug}`;

export const siteSettingsTag = "siteSettings";

export type Taggable = Content | ItemSummary | CollectionSummary | Tag;

export const documentsIn = (value: Taggable): Addressable[] => {
  if (value.kind === "tag") {
    return [value];
  }
  const items = "items" in value ? value.items.flatMap(documentsIn) : [];
  return [value, ...value.tags, ...items];
};

// 結果に付けるタグ。上限を超えるときは、文書ごとのタグを種類ごとのタグに置き換える（粗くなるが無効化は漏れない）
export const tagsFor = (tags: string[], documents: Addressable[], limit: number): string[] => {
  const documentTags = new Set(documents.map(documentTag));
  if (tags.length + documentTags.size <= limit) {
    return [...tags, ...documentTags];
  }
  return [...tags, ...new Set(documents.map((document) => kindTag(document.kind)))];
};

// 文書が作られた・変わった・消えたときに無効にするタグ。slug が変わったときは前後の両方を渡す
export const tagsToInvalidate = (kind: Kind, slugs: string[]): string[] => [
  kindTag(kind),
  ...slugs.map((slug) => documentTag({ kind, slug })),
];

import type { Album, ArticleSummary, Digest, PostList, SongSummary, WorkBase } from "./types";

// テスト用。中身を問わないフィールドは最小限の値で埋める

const work = (): Omit<WorkBase, "title" | "slug"> => (
  { tags: [], createdAt: new Date(0), updatedAt: new Date(0), license: { kind: "unspecified" } }
);
const digest = (): Digest => ({ excerpt: "", length: 0, readingMinutes: 0 });

export const article = (slug: string): ArticleSummary => ({
  kind: "article", slug, title: `記事 ${slug}`, ...work(), ...digest(),
});

export const song = (slug: string): SongSummary => ({
  kind: "song", slug, title: `曲 ${slug}`, artist: [], credit: [], url: [], ...work(), ...digest(),
});

export const postList = (slug: string, items: ArticleSummary[]): PostList => ({
  kind: "postList", slug, title: `リスト ${slug}`, tags: [], items,
});

export const album = (slug: string, items: SongSummary[]): Album => ({
  kind: "album", slug, title: `アルバム ${slug}`, artist: [], credit: [], ...work(), items,
});

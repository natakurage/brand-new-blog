import type { Album, PostList } from "./types";
import { hrefIn, hrefOf, type Addressable } from "./href";

export type NavigationLink = { title: string; href: string };

// slug は、どのリストの中で見ているかを表すクエリの値と照らし合わせる
export type ListNavigation = NavigationLink & {
  slug: string;
  prev: NavigationLink | null;
  next: NavigationLink | null;
};

// リスト・アルバムの中での項目の位置（0 始まり）
export type Placement<C extends PostList | Album> = { collection: C; index: number };

// 同じ項目が2回入っているときは、最初の位置として扱う
export const placementIn = <C extends PostList | Album>(collection: C, itemSlug: string): Placement<C> | null => {
  const index = collection.items.findIndex((item) => item.slug === itemSlug);
  return index === -1 ? null : { collection, index };
};

const navigationAt = ({ collection, index }: Placement<PostList | Album>): ListNavigation => {
  const linkTo = (item: (Addressable & { title: string }) | undefined): NavigationLink | null => (
    item ? { title: item.title, href: hrefIn(item, collection) } : null
  );
  return {
    slug: collection.slug,
    title: collection.title,
    href: hrefOf(collection),
    prev: linkTo(collection.items[index - 1]),
    next: linkTo(collection.items[index + 1]),
  };
};

export const navigationIn = (collection: PostList | Album, itemSlug: string): ListNavigation | null => {
  const placement = placementIn(collection, itemSlug);
  return placement && navigationAt(placement);
};

type Collections<C> = {
  containing(itemSlug: string): Promise<{ slug: string }[]>;
  findBySlug(slug: string): Promise<C | null>;
};

// 見つからないリストや、もう項目を含まないリストは除く
export const placementsFor = async <C extends PostList | Album>(
  itemSlug: string,
  collections: Collections<C>,
): Promise<Placement<C>[]> => {
  const containing = await collections.containing(itemSlug);
  const found = await Promise.all(containing.map(({ slug }) => collections.findBySlug(slug)));
  return found.flatMap((collection) => {
    const placement = collection && placementIn(collection, itemSlug);
    return placement ? [placement] : [];
  });
};

export const navigationsFor = async <C extends PostList | Album>(
  itemSlug: string,
  collections: Collections<C>,
): Promise<ListNavigation[]> => (await placementsFor(itemSlug, collections)).map(navigationAt);

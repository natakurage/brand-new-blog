import type { Album, PostList } from "./types";
import { hrefIn, hrefOf, type Addressable } from "./href";

export type NavigationLink = { title: string; href: string };

// slug は、どのリストの中で見ているかを表すクエリの値と照らし合わせる
export type ListNavigation = NavigationLink & {
  slug: string;
  prev: NavigationLink | null;
  next: NavigationLink | null;
};

// 同じ項目が2回入っているときは、最初の位置として扱う
export const navigationIn = (collection: PostList | Album, itemSlug: string): ListNavigation | null => {
  const { items } = collection;
  const index = items.findIndex((item) => item.slug === itemSlug);
  if (index === -1) {
    return null;
  }
  const linkTo = (item: (Addressable & { title: string }) | undefined): NavigationLink | null => (
    item ? { title: item.title, href: hrefIn(item, collection) } : null
  );
  return {
    slug: collection.slug,
    title: collection.title,
    href: hrefOf(collection),
    prev: linkTo(items[index - 1]),
    next: linkTo(items[index + 1]),
  };
};

type Collections<C> = {
  containing(itemSlug: string): Promise<{ slug: string }[]>;
  findBySlug(slug: string): Promise<C | null>;
};

export const navigationsFor = async <C extends PostList | Album>(
  itemSlug: string,
  collections: Collections<C>,
): Promise<ListNavigation[]> => {
  const containing = await collections.containing(itemSlug);
  const found = await Promise.all(containing.map(({ slug }) => collections.findBySlug(slug)));
  return found.flatMap((collection) => {
    const navigation = collection && navigationIn(collection, itemSlug);
    return navigation ? [navigation] : [];
  });
};

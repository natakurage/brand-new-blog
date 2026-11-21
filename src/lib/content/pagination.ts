import type { Page, PageRequest } from "./repository";

// 一覧の URL はその一覧そのものを指すので、空でも1ページ目は存在する
export const pageCount = (total: number, size: number): number => Math.max(1, Math.ceil(total / size));

export const hasPage = (total: number, { page, size }: PageRequest): boolean => page >= 1 && page <= pageCount(total, size);

export const pageOf = <T>(items: T[], { page, size }: PageRequest): Page<T> => ({
  items: items.slice((page - 1) * size, page * size),
  total: items.length,
});

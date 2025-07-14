/**
 * 参照を解決するユーティリティ型
 * @template T - 元の型
 * @template R - { key: NewType }形式で、参照を解決したいフィールドとその型を指定
 */
export type ResolveReferences<T, R extends { [K in keyof T]?: unknown }> = Omit<T, keyof R> & R;

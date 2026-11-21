import * as v from "valibot";
import { notFound } from "next/navigation";

export const PageNumber = v.pipe(v.string(), v.regex(/^[1-9]\d*$/), v.transform(Number));

export const SlugParam = v.pipe(v.string(), v.minLength(1));

const parseOrNotFound = <S extends v.GenericSchema>(schema: S, input: unknown): v.InferOutput<S> => {
  const result = v.safeParse(schema, input);
  if (!result.success) {
    notFound();
  }
  return result.output;
};

// ルートにあってスキーマにないキーも型エラーにする
export const parseParams = <S extends v.GenericSchema, I extends v.InferInput<S>>(
  schema: S,
  input: I & Record<Exclude<keyof I, keyof v.InferInput<S>>, never>,
): v.InferOutput<S> => parseOrNotFound(schema, input);

// クエリには任意のキーが付きうるので、余分なキーは許す。
// 入力の型が Record なので、スキーマに必須キーがあると型エラーになる（クエリは必ず optional で受ける）。
// optional なキーの値の型は TypeScript の仕様上照合されず、実行時の検証だけが頼り
export const parseSearchParams = <S extends v.GenericSchema>(schema: S, input: v.InferInput<S>): v.InferOutput<S> =>
  parseOrNotFound(schema, input);

export const PageParams = v.strictObject({ page: PageNumber });

export const SlugParams = v.strictObject({ slug: SlugParam });

export const SlugPageParams = v.strictObject({ slug: SlugParam, page: PageNumber });

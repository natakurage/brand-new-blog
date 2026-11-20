import * as v from "valibot";
import { notFound } from "next/navigation";

export const PageNumber = v.pipe(v.string(), v.regex(/^[1-9]\d*$/), v.transform(Number));

export const SlugParam = v.pipe(v.string(), v.minLength(1));

export const parseParams = <S extends v.GenericSchema>(schema: S, input: unknown): v.InferOutput<S> => {
  const result = v.safeParse(schema, input);
  if (!result.success) {
    notFound();
  }
  return result.output;
};

export const PageParams = v.object({ page: PageNumber });

export const SlugParams = v.object({ slug: SlugParam });

export const SlugPageParams = v.object({ slug: SlugParam, page: PageNumber });

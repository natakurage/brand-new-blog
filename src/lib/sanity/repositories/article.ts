import type { ArticleRepository } from "@/lib/content/repository";
import { articleBySlugQuery, articleListQuery, articleSearchQuery, articleSlugsQuery, relatedArticlesQuery } from "../queries";
import { toArticleSummary, toBlogPost } from "../mappers";
import type { SanityBlogPostResolved } from "../types";
import { cacheFor, DAY, sliceOf, type ClientFor } from "../fetchOptions";
import { slugLookup } from "./capabilities";

type ArticlePage = { items: SanityBlogPostResolved[]; total: number };

const cacheTag = "blogPost";

export const createSanityArticleRepository = (clientFor: ClientFor): ArticleRepository => ({
  ...slugLookup(clientFor, { cacheTag, bySlugQuery: articleBySlugQuery, slugsQuery: articleSlugsQuery, map: toBlogPost }),

  async list({ page, tag, slugs, exclude }, ctx) {
    const tags = [
      cacheTag,
      ...(tag ? [`${cacheTag}:tag:${tag}`] : []),
      ...[...(slugs ?? []), ...(exclude ?? [])].map((slug) => `${cacheTag}:slug:${slug}`),
      ...(!tag && !slugs && !exclude?.length ? [`${cacheTag}-collection`] : []),
    ];
    const result = await clientFor(ctx).fetch<ArticlePage>(
      articleListQuery,
      { tagSlug: tag ?? null, slugs: slugs ?? null, exclude: exclude ?? null, ...sliceOf(page) },
      cacheFor(tags, DAY),
    );
    return { items: result.items.map(toArticleSummary), total: result.total };
  },

  async related(article, limit, ctx) {
    const tagSlugs = article.tags.map((tag) => tag.slug).filter(Boolean);
    const entries = await clientFor(ctx).fetch<SanityBlogPostResolved[]>(
      relatedArticlesQuery,
      { slug: article.slug, tagSlugs, limit },
      cacheFor([cacheTag], DAY),
    );
    return entries.map(toArticleSummary);
  },

  async search(text, page, ctx) {
    const terms = text.split(" ").filter(Boolean);
    const result = await clientFor(ctx).fetch<ArticlePage>(
      articleSearchQuery,
      { terms, ...sliceOf(page) },
      cacheFor([cacheTag], 10),
    );
    return { items: result.items.map(toArticleSummary), total: result.total };
  },
});

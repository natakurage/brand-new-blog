import type { ArticleRepository } from "@/lib/content/repository";
import { articleBySlugQuery, articleListQuery, articleSearchQuery, articleSlugsQuery, relatedArticlesQuery } from "../queries";
import { toArticleSummary, toBlogPost } from "../mappers";
import type { SanityBlogPostResolved } from "../types";
import { cacheFor, DAY, sliceOf, type ClientFor } from "../fetchOptions";

type ArticlePage = { items: SanityBlogPostResolved[]; total: number };

const type = "blogPost";

export const createSanityArticleRepository = (clientFor: ClientFor): ArticleRepository => ({
  async findBySlug(slug, ctx) {
    const entry = await clientFor(ctx).fetch<SanityBlogPostResolved | null>(
      articleBySlugQuery,
      { slug },
      cacheFor([type, `${type}:slug:${slug}`], DAY),
    );
    return entry ? toBlogPost(entry) : null;
  },

  async list({ page, tag, slugs, exclude }, ctx) {
    const tags = [
      type,
      ...(tag ? [`${type}:tag:${tag}`] : []),
      ...[...(slugs ?? []), ...(exclude ?? [])].map((slug) => `${type}:slug:${slug}`),
      ...(!tag && !slugs && !exclude?.length ? [`${type}-collection`] : []),
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
      cacheFor([type], DAY),
    );
    return entries.map(toArticleSummary);
  },

  async search(text, page, ctx) {
    const terms = text.split(" ").filter(Boolean);
    const result = await clientFor(ctx).fetch<ArticlePage>(
      articleSearchQuery,
      { terms, ...sliceOf(page) },
      cacheFor([type], 10),
    );
    return { items: result.items.map(toArticleSummary), total: result.total };
  },

  async allSlugs() {
    return clientFor({ preview: false }).fetch<string[]>(articleSlugsQuery, {}, cacheFor([], 10));
  },
});

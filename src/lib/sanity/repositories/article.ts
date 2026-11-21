import type { ArticleRepository } from "@/lib/content/repository";
import {
  articleAddressesQuery,
  articleBySlugQuery,
  articleListQuery,
  articleSearchAddressesQuery,
  articleSearchQuery,
  articleSlugsQuery,
  relatedArticlesQuery,
} from "../queries";
import { toAddress, toArticleSummary, toBlogPost } from "../mappers";
import type { SanityBlogPostResolved } from "../types";
import { sliceOf, type ClientFor } from "../fetchOptions";
import { slugLookup } from "./capabilities";

type ArticlePage = { items: SanityBlogPostResolved[]; total: number };
type Address = { _type: string; slug: string };

const termsOf = (text: string): string[] => text.split(" ").filter(Boolean);

export const createSanityArticleRepository = (clientFor: ClientFor): ArticleRepository => ({
  ...slugLookup(clientFor, { bySlugQuery: articleBySlugQuery, slugsQuery: articleSlugsQuery, map: toBlogPost }),

  async list({ page, slugs, exclude }, ctx) {
    const result = await clientFor(ctx).fetch<ArticlePage>(
      articleListQuery,
      { slugs: slugs ?? null, exclude: exclude ?? null, ...sliceOf(page) },
    );
    return { items: result.items.map(toArticleSummary), total: result.total };
  },

  async related(article, limit, ctx) {
    const tagSlugs = article.tags.map((tag) => tag.slug);
    const entries = await clientFor(ctx).fetch<SanityBlogPostResolved[]>(
      relatedArticlesQuery,
      { slug: article.slug, tagSlugs, limit },
    );
    return entries.map(toArticleSummary);
  },

  async addresses(ctx) {
    const entries = await clientFor(ctx).fetch<Address[]>(articleAddressesQuery, { slugs: null, exclude: null });
    return entries.map(toAddress);
  },

  async searchAddresses(text, ctx) {
    const entries = await clientFor(ctx).fetch<Address[]>(articleSearchAddressesQuery, { terms: termsOf(text) });
    return entries.map(toAddress);
  },

  async search(text, page, ctx) {
    const terms = termsOf(text);
    const result = await clientFor(ctx).fetch<ArticlePage>(articleSearchQuery, { terms, ...sliceOf(page) });
    return { items: result.items.map(toArticleSummary), total: result.total };
  },
});

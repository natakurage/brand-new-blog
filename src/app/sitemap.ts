import type { MetadataRoute } from "next";
import { repositories } from "@/lib/repositories";
import { ORIGIN } from "@/lib/config";
import { hrefOf, pageHref } from "@/lib/content/href";
import { pageCount } from "@/lib/content/pagination";

type SitemapEntry = MetadataRoute.Sitemap[number];

const firstItem = { page: 1, size: 1 };

const collections = [
	{
		basePath: "/articles",
		priority: 0.7,
		count: () => repositories.articles.list({ page: firstItem }).then((page) => page.total),
	},
	{
		basePath: "/songs",
		priority: 0.7,
		count: () => repositories.songs.list(firstItem).then((page) => page.total),
	},
	{
		basePath: "/albums",
		priority: 0.7,
		count: () => repositories.albums.list(firstItem).then((page) => page.total),
	},
	{
		basePath: "/lists",
		priority: 0.7,
		count: () => repositories.postLists.list(firstItem).then((page) => page.total),
	},
];

function toAbsoluteUrl(path: string) {
	return new URL(path, ORIGIN).href;
}

function buildEntry(path: string, priority: number, changeFrequency: SitemapEntry["changeFrequency"] = "weekly"): SitemapEntry {
	return {
		url: toAbsoluteUrl(path),
		changeFrequency,
		priority,
	};
}

function buildPageEntries(basePath: string, totalItems: number, itemsPerPage: number, priority = 0.8): MetadataRoute.Sitemap {
	const totalPages = pageCount(totalItems, itemsPerPage);
	return Array.from({ length: totalPages }, (_, index) => ({
		url: toAbsoluteUrl(pageHref(basePath, index + 1)),
		changeFrequency: "weekly" as const,
		priority: index === 0 ? priority : 0.5,
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const data = await repositories.siteSettings.get();
	const [tagSlugs, collectionTotals, articleSlugs, songSlugs, albumSlugs, listSlugs] = await Promise.all([
		repositories.tags.allSlugs(),
		Promise.all(collections.map((section) => section.count())),
		repositories.articles.allSlugs(),
		repositories.songs.allSlugs(),
		repositories.albums.allSlugs(),
		repositories.postLists.allSlugs(),
	]);
	const [albumDetails, listDetails] = await Promise.all([
		Promise.all(albumSlugs.map((slug) => repositories.albums.findBySlug(slug))),
		Promise.all(listSlugs.map((slug) => repositories.postLists.findBySlug(slug))),
	]);

	return [
		buildEntry("/", 1, "daily"),
		...collections.flatMap((section, index) => buildPageEntries(section.basePath, collectionTotals[index], data.itemsPerPage, section.priority)),
		...articleSlugs.map((slug) => buildEntry(hrefOf({ slug, kind: "article" }), 0.7)),
		...songSlugs.map((slug) => buildEntry(hrefOf({ slug, kind: "song" }), 0.7)),
		...albumDetails.flatMap((album) => album ? buildPageEntries(hrefOf(album), album.items.length, data.itemsPerPage, 0.7) : []),
		...listDetails.flatMap((list) => list ? buildPageEntries(hrefOf(list), list.items.length, data.itemsPerPage, 0.7) : []),
		...tagSlugs.map((slug) => buildEntry(hrefOf({ slug, kind: "tag" }), 0.6)),
	];
}

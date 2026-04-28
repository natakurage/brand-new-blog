import type { MetadataRoute } from "next";
import { AlbumManager, BlogPostManager, PostListManager, SongManager, getAllTags, loadGlobalSettings } from "@/lib/cms";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

type SitemapEntry = MetadataRoute.Sitemap[number];

const articleManager = new BlogPostManager();
const songManager = new SongManager();
const albumManager = new AlbumManager();
const listManager = new PostListManager();

const collectionManagers = [
	{
		basePath: "/articles",
		priority: 0.7,
		manager: articleManager,
		getPaths: () => articleManager.getAllSlugs(),
	},
	{
		basePath: "/songs",
		priority: 0.7,
		manager: songManager,
		getPaths: () => songManager.getAllSlugs(),
	},
	{
		basePath: "/albums",
		priority: 0.7,
		manager: albumManager,
		getPaths: () => albumManager.getAllSlugs(),
	},
	{
		basePath: "/lists",
		priority: 0.7,
		manager: listManager,
		getPaths: () => listManager.getAllIds(),
	},
] as const;

function toAbsoluteUrl(path: string) {
	return new URL(path, SITE_ORIGIN).href;
}

function buildEntry(path: string, priority: number, changeFrequency: SitemapEntry["changeFrequency"] = "weekly"): SitemapEntry {
	return {
		url: toAbsoluteUrl(path),
		changeFrequency,
		priority,
	};
}

function buildPageEntries(basePath: string, totalItems: number, itemsPerPage: number, priority = 0.8): MetadataRoute.Sitemap {
	const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
	return Array.from({ length: totalPages }, (_, index) => ({
		url: toAbsoluteUrl(`${basePath}/page/${index + 1}`),
		changeFrequency: "weekly" as const,
		priority: index === 0 ? priority : 0.5,
	}));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const data = await loadGlobalSettings();
	const [tags, collectionTotals, collectionPaths] = await Promise.all([
		getAllTags(),
		Promise.all(collectionManagers.map((section) => section.manager.getNewest({ page: 0, limit: 1 }))),
		Promise.all(collectionManagers.map((section) => section.getPaths())),
	]);
	const [albumDetails, listDetails] = await Promise.all([
		Promise.all(collectionPaths[2].map((slug) => albumManager.getBySlug(slug))),
		Promise.all(collectionPaths[3].map((id) => listManager.get(id))),
	]);

	return [
		buildEntry("/", 1, "daily"),
		...collectionManagers.flatMap((section, index) => buildPageEntries(section.basePath, collectionTotals[index].total, data.itemsPerPage, section.priority)),
		...collectionPaths[0].map((slug) => buildEntry(`/articles/${slug}`, 0.7)),
		...collectionPaths[1].map((slug) => buildEntry(`/songs/${slug}`, 0.7)),
		...albumDetails.flatMap((album) => album ? buildPageEntries(`/albums/${album.slug}`, album.items.length, data.itemsPerPage, 0.7) : []),
		...listDetails.flatMap((list) => list ? buildPageEntries(`/lists/${list.id}`, list.items.length, data.itemsPerPage, 0.7) : []),
		...tags.map((tag) => buildEntry(`/tags/${tag.slug}/page/1`, 0.6)),
	];
}

export const revalidate = 3600; // 1 hour

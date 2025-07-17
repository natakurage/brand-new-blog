import ListList from "@/components/ListList";
import { loadGlobalSettings } from "@/lib/cmsUtils";
import { AlbumManager } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { page: string } }) {
  const data = await loadGlobalSettings();
  const title = "アルバム一覧 - " + data.siteName + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function AlbumsPage({ params }: { params: { page: string } }) {
  const pageNum = Number(params.page);
  const { items, limit } = await new AlbumManager().getNewest({
    page: pageNum - 1,
    limit: 10,
  });
  if (items.length === 0) {
    return notFound();
  }
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">アルバム一覧</h1>
      <ListList basePath="/albums" lists={items} total={items.length} page={pageNum} limit={limit} />
    </div>
  );
}
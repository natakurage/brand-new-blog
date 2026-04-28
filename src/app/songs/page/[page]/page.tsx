import ItemList from "@/components/ItemList";
import { loadGlobalSettings } from "@/lib/cms";
import { SongManager } from "@/lib/cms";
import { notFound } from "next/navigation";

export async function generateMetadata(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const data = await loadGlobalSettings();
  const title = "曲一覧 - " + data.siteName + (params.page === "1" ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function SongsPage(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const data = await loadGlobalSettings();
  const pageNum = Number(params.page);
  const manager = new SongManager();
  const { items: songs, total, limit } = await manager.getNewest({
    page: pageNum - 1,
    limit: data.itemsPerPage,
  });
  if (songs.length === 0) {
    return notFound();
  }
  return (
    <ItemList basePath="/songs" items={songs} page={pageNum} total={total} limit={limit} />
  );
}

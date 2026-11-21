import ItemList from "@/components/ItemList";
import { parseParams, PageParams } from "@/lib/params";
import { repositories } from "@/lib/repositories";
import { pageHref } from "@/lib/content/href";
import { notFound } from "next/navigation";

export async function generateMetadata(props: PageProps<"/songs/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const title = "曲一覧 - " + data.siteName + (params.page === 1 ? "" : `: Page ${params.page}`);
  return { title };
}

export default async function SongsPage(props: PageProps<"/songs/page/[page]">) {
  const params = parseParams(PageParams, await props.params);
  const data = await repositories.siteSettings.get();
  const pageNum = params.page;
  const { items: songs, total } = await repositories.songs.list(
    { page: pageNum, size: data.itemsPerPage },
    { preview: false },
  );
  if (songs.length === 0) {
    return notFound();
  }
  return (
    <ItemList hrefFor={(n) => pageHref("/songs", n)} items={songs} page={pageNum} total={total} limit={data.itemsPerPage} />
  );
}

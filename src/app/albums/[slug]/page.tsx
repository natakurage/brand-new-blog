import { AlbumManager } from "@/lib/contentful";
import { notFound } from "next/navigation";
import data from "@/app/data/data.json";
import ItemList from "@/components/ItemList";

export async function generateMetadata ({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const album = await new AlbumManager().getBySlug(slug, false);
  if (!album) { 
    notFound();
  }
  return {
    title: `アルバム "${album.title}"` + " - " + data.siteName,
  };
}

export default async function AlbumPage(
  { params, searchParams }
  : { params: { slug: string }, searchParams: { page?: string } }
) {
  const { slug } = params;
  const { page = 1 } = searchParams;
  const pageNum = Number(page);
  const album = await new AlbumManager().getBySlug(slug, false);
  if (!album) { 
    notFound();
  }
  const songs = album.items;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">アルバム &ldquo;{album.title}&rdquo;</h1>
      <div>{album.artist?.join(", ")}</div>
      <p className="text-sm">{album.description}</p>
      <ItemList
        items={songs}
        total={songs.length}
        page={pageNum}
        limit={10}
        suffix={`?key=${album.slug}`}
        showDate={false}
      />
    </div>
  );
}
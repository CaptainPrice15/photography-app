import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getFavoritePhotos } from "@/app/actions/favorites";
import { getBlurDataUrls } from "@/app/actions/blur";
import { FavouritesGallery } from "./FavouritesGallery";
import type { Photo } from "@/lib/storage/types";

export const metadata: Metadata = {
  title: "Favourites",
  description: "Your saved photos.",
};

export const dynamic = "force-dynamic";

export default async function FavouritesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?returnTo=/favourites");
  }

  const photos = await getFavoritePhotos();

  const firstPageIds = photos.slice(0, 20).map((p) => p.id);
  const blurMap = await getBlurDataUrls(firstPageIds);

  const enriched: Photo[] = photos.map((p) => ({
    ...p,
    blurDataURL: blurMap[p.id] ?? p.blurDataURL,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="label mb-3">Saved</p>
        <h1 className="text-h1 font-semibold tracking-tight">Favourites</h1>
        <p className="mt-4 max-w-2xl text-muted">
          {photos.length > 0
            ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"} you've saved.`
            : "Photos you favourite will appear here."}
        </p>
      </header>

      <FavouritesGallery photos={enriched} />
    </div>
  );
}

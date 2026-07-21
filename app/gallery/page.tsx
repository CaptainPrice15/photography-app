import type { Metadata } from "next";
import { photoSource } from "@/lib/storage";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { TextReveal } from "@/components/shared/TextReveal";
import { getBlurDataUrls } from "@/app/actions/blur";
import type { Photo } from "@/lib/storage/types";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the full photography library in a responsive masonry grid.",
};

export const dynamic = "force-dynamic";

export const revalidate = 3600;

const INITIAL_VISIBLE = 20;

export default async function GalleryPage() {
  const [collections, photos] = await Promise.all([
    photoSource.getCollections(),
    photoSource.getAllPhotos(),
  ]);

  const firstPageIds = photos.slice(0, INITIAL_VISIBLE).map((p) => p.id);
  const blurMap = await getBlurDataUrls(firstPageIds);

  const enriched: Photo[] = photos.map((p) => ({
    ...p,
    blurDataURL: blurMap[p.id] ?? p.blurDataURL,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionReveal as="header" className="mb-12">
        <p className="label mb-3">Archive</p>
        <TextReveal as="h1" className="text-h1 font-semibold tracking-tight">
          The full library
        </TextReveal>
        <p className="mt-4 max-w-2xl text-muted">
          Every photo in one place. Filter by collection, click any frame to view
          it full-screen, and navigate with arrow keys or swipe.
        </p>
      </SectionReveal>

      <MasonryGallery collections={collections} photos={enriched} />
    </div>
  );
}

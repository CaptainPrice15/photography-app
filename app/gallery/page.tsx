import type { Metadata } from "next";
import { photoSource } from "@/lib/storage";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { SectionReveal } from "@/components/shared/SectionReveal";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the full photography library in a responsive masonry grid.",
};

export const dynamic = "force-dynamic";

export const revalidate = 3600;

export default async function GalleryPage() {
  const [collections, photos] = await Promise.all([
    photoSource.getCollections(),
    photoSource.getAllPhotos(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionReveal as="header" className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Gallery</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every photo in one place. Filter by collection, click any frame to view it
          full-screen, and navigate with arrow keys or swipe.
        </p>
      </SectionReveal>

      <MasonryGallery collections={collections} photos={photos} />
    </div>
  );
}

import type { Metadata } from "next";
import { photoSource } from "@/lib/storage";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { TextReveal } from "@/components/shared/TextReveal";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the full photography library in a responsive masonry grid.",
};

export const revalidate = 3600;

export default async function GalleryPage() {
  const [collections, photos] = await Promise.all([
    photoSource.getCollections(),
    photoSource.getAllPhotos(),
  ]);

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

      <MasonryGallery collections={collections} photos={photos} />
    </div>
  );
}

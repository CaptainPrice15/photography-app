import { photoSource } from "@/lib/storage";
import { Hero } from "@/components/home/Hero";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [collections, featured] = await Promise.all([
    photoSource.getCollections(),
    photoSource.getFeatured(),
  ]);

  const latest = (await photoSource.getAllPhotos()).slice(0, 8);

  return (
    <div>
      <Hero photos={featured} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Collections</h2>
            <p className="mt-2 text-muted">
              Themed albums, each with its own mood and accent.
            </p>
          </div>
          <Link
            href="/collections"
            className="hidden shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent sm:block"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Latest</h2>
            <p className="mt-2 text-muted">Fresh frames from across the library.</p>
          </div>
          <Link
            href="/gallery"
            className="hidden shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent sm:block"
          >
            Open gallery
          </Link>
        </div>

        <MasonryGallery collections={collections} photos={latest} />
      </section>
    </div>
  );
}

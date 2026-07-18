import { photoSource } from "@/lib/storage";
import { Hero } from "@/components/home/Hero";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { SectionReveal, RevealItem } from "@/components/shared/SectionReveal";
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

      <SectionReveal
        as="section"
        stagger
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <RevealItem>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Collections</h2>
              <p className="mt-2 text-muted">
                Themed albums, each with its own mood and accent.
              </p>
            </div>
          </RevealItem>
          <RevealItem className="hidden shrink-0 sm:block">
            <Link
              href="/collections"
              className="rounded-full border border-border bg-surface-65 px-4 py-2 text-sm font-medium text-muted backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm focus-glow active:scale-[0.98]"
            >
              View all
            </Link>
          </RevealItem>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      </SectionReveal>

      <SectionReveal
        as="section"
        className="cv-auto mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Latest</h2>
            <p className="mt-2 text-muted">Fresh frames from across the library.</p>
          </div>
          <Link
            href="/gallery"
            className="hidden shrink-0 rounded-full border border-border bg-surface-65 px-4 py-2 text-sm font-medium text-muted backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm focus-glow active:scale-[0.98] sm:block"
          >
            Open gallery
          </Link>
        </div>

        <MasonryGallery collections={collections} photos={latest} />
      </SectionReveal>
    </div>
  );
}

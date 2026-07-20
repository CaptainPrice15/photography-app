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

  const latest = (await photoSource.getAllPhotos()).slice(0, 12);

  const marqueeItems = [
    ...collections.map((c) => c.title),
    "Available as prints",
    "Commissions open",
    "Light is the only subject",
  ];

  return (
    <div>
      <Hero photos={featured} />

      {/* Marquee strip */}
      <div className="marquee-mask relative overflow-hidden border-y border-border-25 bg-surface/40 py-3">
        <div className="marquee gap-8 px-4">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8" aria-hidden={dup === 1}>
              {marqueeItems.map((item, i) => (
                <span key={i} className="flex items-center gap-8 text-sm font-medium text-muted">
                  {item}
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <SectionReveal
        as="section"
        stagger
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <RevealItem>
            <div>
              <p className="label mb-3">Collections</p>
              <h2 className="text-h2 font-semibold tracking-tight">
                Albums with their own weather.
              </h2>
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

        <div className="grid auto-rows-[180px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c, i) => (
            <CollectionCard
              key={c.id}
              collection={c}
              index={i}
              featured={i === 0}
              className={i === 0 ? "sm:col-span-2" : ""}
            />
          ))}
        </div>
      </SectionReveal>

      <SectionReveal
        as="section"
        className="cv-auto mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="label mb-3">Latest</p>
            <h2 className="text-h2 font-semibold tracking-tight">Fresh frames</h2>
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

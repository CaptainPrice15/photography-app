import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { photoSource } from "@/lib/storage";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { CollectionThemeSetter } from "@/components/theme/CollectionThemeSetter";
import { SectionReveal } from "@/components/shared/SectionReveal";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const collections = await photoSource.getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await photoSource.getCollection(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await photoSource.getCollection(slug);
  if (!collection) notFound();

  const collections = await photoSource.getCollections();

  return (
    <div>
      <CollectionThemeSetter
        accent={collection.accent}
        accentSoft={collection.accentSoft}
      />

      <header className="relative">
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
          <Image
            src={collection.cover}
            alt={collection.title}
            fill
            sizes="100vw"
            unoptimized={collection.photos[0]?.unoptimized}
            className="object-cover"
            placeholder="blur"
            blurDataURL={collection.photos[0]?.blurDataURL}
          />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${collection.accent}, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </div>
        <div className="mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal
            className="inline-block rounded-2xl border border-border bg-surface/80 px-5 py-4 backdrop-blur"
            style={{ boxShadow: `0 10px 40px -10px ${collection.accent}55` }}
          >
            <h1 className="text-4xl font-semibold tracking-tight">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="mt-2 max-w-xl text-muted">{collection.description}</p>
            )}
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-accent">
              {collection.photos.length} photos
            </p>
          </SectionReveal>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MasonryGallery collections={collections} photos={collection.photos} />
      </section>
    </div>
  );
}

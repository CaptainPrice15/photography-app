import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { photoSource } from "@/lib/storage";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { CollectionThemeSetter } from "@/components/theme/CollectionThemeSetter";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { TextReveal } from "@/components/shared/TextReveal";
import { ProtectedImage } from "@/components/shared/ProtectedImage";

export const revalidate = 3600;

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
        <div className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
          <ProtectedImage
            src={`${collection.cover}?size=preview`}
            alt={collection.title}
            fill
            sizes="100vw"
            unoptimized={collection.photos[0]?.unoptimized}
            className="absolute inset-0 object-cover"
            placeholder={collection.photos[0]?.blurDataURL ? "blur" : "empty"}
            blurDataURL={collection.photos[0]?.blurDataURL}
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${collection.accent}, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        </div>
        <div className="mx-auto -mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionReveal
            className="inline-block rounded-3xl border border-border bg-surface/80 px-6 py-5 backdrop-blur"
            style={{ boxShadow: `0 18px 60px -16px ${collection.accent}66` }}
          >
            <p className="label mb-2 text-accent">
              {collection.photos.length} photos
            </p>
            <TextReveal as="h1" className="text-h1 font-semibold tracking-tight">
              {collection.title}
            </TextReveal>
            {collection.description && (
              <p className="mt-3 max-w-xl text-muted">{collection.description}</p>
            )}
          </SectionReveal>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MasonryGallery collections={collections} photos={collection.photos} />
      </section>
    </div>
  );
}

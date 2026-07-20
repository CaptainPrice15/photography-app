import type { Metadata } from "next";
import { photoSource } from "@/lib/storage";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { SectionReveal } from "@/components/shared/SectionReveal";
import { TextReveal } from "@/components/shared/TextReveal";

export const metadata: Metadata = {
  title: "Collections",
  description: "Themed photography albums, each with its own palette and mood.",
};

export const dynamic = "force-dynamic";

export const revalidate = 3600;

export default async function CollectionsPage() {
  const collections = await photoSource.getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionReveal as="header" className="mb-12">
        <p className="label mb-3">Series</p>
        <TextReveal as="h1" className="text-h1 font-semibold tracking-tight">
          Collections
        </TextReveal>
        <p className="mt-4 max-w-2xl text-muted">
          Curated sets of work. Open one to step into its color world — the whole
          interface retints to match.
        </p>
      </SectionReveal>

      <div className="grid auto-rows-[180px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => (
          <CollectionCard
            key={c.id}
            collection={c}
            index={i}
            featured={i === 0}
            className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
          />
        ))}
      </div>
    </div>
  );
}

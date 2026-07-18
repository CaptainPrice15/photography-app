import type { Metadata } from "next";
import { photoSource } from "@/lib/storage";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { SectionReveal } from "@/components/shared/SectionReveal";

export const metadata: Metadata = {
  title: "Collections",
  description: "Themed photography albums, each with its own palette and mood.",
};

export const dynamic = "force-dynamic";

export const revalidate = 3600;

export default async function CollectionsPage() {
  const collections = await photoSource.getCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionReveal as="header" className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Collections</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Curated sets of work. Open one to step into its color world — the whole
          interface retints to match.
        </p>
      </SectionReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
    </div>
  );
}

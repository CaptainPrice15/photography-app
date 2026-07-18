"use client";

import { useMemo, useState } from "react";
import type { Collection, Photo } from "@/lib/storage/types";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { CollectionFilter } from "./CollectionFilter";

interface Props {
  collections: Collection[];
  photos: Photo[];
}

export function MasonryGallery({ collections, photos }: Props) {
  const [active, setActive] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "all" ? photos : photos.filter((p) => p.collectionId === active)),
    [active, photos]
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <CollectionFilter collections={collections} active={active} onChange={setActive} />
        <p className="text-sm text-muted">{filtered.length} photos</p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">No photos in this collection yet.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
          {filtered.map((p, i) => (
            <PhotoCard
              key={p.id}
              photo={p}
              onOpen={() => setOpenIndex(i)}
              priority={i < 4}
            />
          ))}
        </div>
      )}

      <Lightbox
        photos={filtered}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  );
}

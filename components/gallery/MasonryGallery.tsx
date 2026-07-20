"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import type { Collection, Photo } from "@/lib/storage/types";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import { CollectionFilter } from "./CollectionFilter";

interface Props {
  collections: Collection[];
  photos: Photo[];
}

const PAGE_SIZE = 20;

export function MasonryGallery({ collections, photos }: Props) {
  const [active, setActive] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const loaderRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loaderRef, { margin: "200px" });

  useEffect(() => {
    setPage(1);
  }, [active]);

  const filtered = useMemo(
    () => (active === "all" ? photos : photos.filter((p) => p.collectionId === active)),
    [active, photos]
  );

  const visiblePhotos = useMemo(() => {
    return filtered.slice(0, page * PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (isInView && visiblePhotos.length < filtered.length) {
      setPage((prev) => prev + 1);
    }
  }, [isInView, visiblePhotos.length, filtered.length]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <CollectionFilter collections={collections} active={active} onChange={setActive} />
        <p className="text-sm text-muted">{filtered.length} photos</p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">No photos in this collection yet.</p>
      ) : (
        <div className="cv-auto columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
          {visiblePhotos.map((p, i) => (
            <PhotoCard
              key={p.id}
              photo={p}
              onOpen={() => setOpenIndex(i)}
              priority={i < 4}
            />
          ))}
        </div>
      )}
      
      {visiblePhotos.length < filtered.length && (
        <div ref={loaderRef} className="h-20 w-full flex items-center justify-center mt-8">
          <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
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

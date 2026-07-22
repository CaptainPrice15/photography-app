"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  useScroll,
  useVelocity,
  useTransform,
  motion,
} from "framer-motion";
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

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const skewY = useTransform(
    scrollVelocity,
    [-2000, 0, 2000],
    [1.2, 0, -1.2],
    { clamp: true }
  );

  const filtered = useMemo(
    () => (active === "all" ? photos : photos.filter((p) => p.collectionId === active)),
    [active, photos]
  );

  const visiblePhotos = useMemo(() => {
    return filtered.slice(0, page * PAGE_SIZE);
  }, [filtered, page]);

  const handleFilterChange = (next: string) => {
    setActive(next);
    setPage(1);
  };

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visiblePhotos.length < filtered.length) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visiblePhotos.length, filtered.length]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <CollectionFilter collections={collections} active={active} onChange={handleFilterChange} />
        <p className="text-sm text-muted">{filtered.length} photos</p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">No photos in this collection yet.</p>
      ) : (
        <motion.div
          style={{ skewY }}
          className="cv-auto columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]"
        >
          {visiblePhotos.map((p, i) => (
            <PhotoCard
              key={p.id}
              photo={p}
              onOpen={() => setOpenIndex(i)}
              priority={i < 4}
            />
          ))}
        </motion.div>
      )}

      {visiblePhotos.length < filtered.length && (
        <div ref={loaderRef} className="mt-8 flex h-12 w-full items-center justify-center">
          <span className="flex items-center gap-2 text-sm text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            <span className="ml-2">Loading more</span>
          </span>
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

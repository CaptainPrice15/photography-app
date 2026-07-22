"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/storage/types";
import { PhotoCard } from "@/components/gallery/PhotoCard";
import { Lightbox } from "@/components/gallery/Lightbox";
import Link from "next/link";

interface Props {
  photos: Photo[];
}

const PAGE_SIZE = 20;

export function FavouritesGallery({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const loaderRef = useRef<HTMLDivElement>(null);

  const visiblePhotos = useMemo(() => {
    return photos.slice(0, page * PAGE_SIZE);
  }, [photos, page]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visiblePhotos.length < photos.length) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visiblePhotos.length, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted">No favourites yet.</p>
        <Link
          href="/gallery"
          className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
        >
          Browse gallery
        </Link>
      </div>
    );
  }

  return (
    <div>
      <motion.div className="cv-auto columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [column-fill:_balance]">
        {visiblePhotos.map((p, i) => (
          <PhotoCard
            key={p.id}
            photo={p}
            onOpen={() => setOpenIndex(i)}
            priority={i < 4}
          />
        ))}
      </motion.div>

      {visiblePhotos.length < photos.length && (
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
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  );
}

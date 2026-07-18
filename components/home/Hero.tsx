"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/storage/types";
import { motion } from "framer-motion";

export function Hero({ photos }: { photos: Photo[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    const id = setInterval(() => embla.scrollNext(), 5500);
    return () => {
      clearInterval(id);
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  if (photos.length === 0) return null;

  return (
    <section className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((p) => (
            <div key={p.id} className="relative h-[78vh] min-h-[520px] w-full shrink-0 grow-0 basis-full">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority
                sizes="100vw"
                unoptimized={p.unoptimized}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
              <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
                    Featured
                  </p>
                  <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                    {p.title}
                  </h1>
                  <p className="mt-4 max-w-xl text-white/80">
                    A curated frame from the latest collection. Explore the full gallery
                    and themed albums.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href="/gallery"
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
                    >
                      View Gallery
                    </Link>
                    <Link
                      href="/collections"
                      className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
                    >
                      Collections
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === selected ? "w-8 bg-white" : "w-2.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import type { Photo } from "@/lib/storage/types";

const container = {
  hidden: {},
  show: {
    transition: { delayChildren: 0.15, staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

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
          {photos.map((p, idx) => (
            <div
              key={p.id}
              className="relative h-[88vh] min-h-[560px] w-full shrink-0 grow-0 basis-full"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: idx === selected ? 1.08 : 1.02,
                }}
                transition={{ duration: 6, ease: "linear" }}
              >
                <ProtectedImage
                  src={p.src}
                  alt={p.alt}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  unoptimized={p.unoptimized}
                  className="absolute inset-0 object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <motion.div
                  key={p.id}
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.p
                    variants={item}
                    className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur"
                  >
                    Featured
                  </motion.p>
                  <motion.h1
                    variants={item}
                    className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl"
                  >
                    {p.title}
                  </motion.h1>
                  <motion.p
                    variants={item}
                    className="mt-4 max-w-xl text-white/80"
                  >
                    A curated frame from the latest collection. Explore the full
                    gallery and themed albums.
                  </motion.p>
                  <motion.div
                    variants={item}
                    className="mt-8 flex flex-wrap gap-3"
                  >
                    <Link
                      href="/gallery"
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
                    >
                      View Gallery
                    </Link>
                    <Link
                      href="/collections"
                      className="glass rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
                    >
                      Collections
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === selected
                ? "w-8 bg-white shadow-glow-sm"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

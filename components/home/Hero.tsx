"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import { TextReveal } from "@/components/shared/TextReveal";
import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/storage/types";

const TAGLINE = ["Light is", "the only", "subject."];

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
    duration: 28,
  });
  const [selected, setSelected] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    embla.on("select", onSelect);
    const id = setInterval(() => embla.scrollNext(), 6000);
    return () => {
      clearInterval(id);
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  if (photos.length === 0) return null;

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="relative"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {photos.map((p, idx) => (
            <div
              key={p.id}
              className="relative h-[92vh] min-h-[560px] w-full shrink-0 grow-0 basis-full overflow-hidden"
            >
              <motion.div
                className="absolute inset-0"
                style={{ y }}
                animate={{
                  scale: idx === selected ? 1.12 : 1.04,
                }}
                transition={{ duration: 7, ease: "linear" }}
              >
                <ProtectedImage
                  src={`${p.src}?size=${idx === selected || idx === 0 ? "preview" : "thumb"}`}
                  alt={p.alt}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  unoptimized={p.unoptimized}
                  className="absolute inset-0 object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
                <motion.div
                  key={p.id}
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.p
                    variants={item}
                    className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white backdrop-blur"
                  >
                    Featured · {p.title}
                  </motion.p>
                  <TextReveal
                    as="h1"
                    className="display max-w-4xl text-white"
                  >
                    {TAGLINE.join("\n")}
                  </TextReveal>
                  <motion.p
                    variants={item}
                    className="mt-5 max-w-xl text-base text-white/80 sm:text-lg"
                  >
                    A curated frame from the latest collection. Explore the full
                    gallery and themed albums.
                  </motion.p>
                  <motion.div
                    variants={item}
                    className="mt-9 flex flex-wrap gap-3"
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

      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => embla?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === selected
                ? "w-8 bg-white shadow-glow-sm"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      <div className="absolute bottom-10 right-6 z-10 hidden items-center gap-2 text-white/60 sm:flex">
        <span className="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-white/40" />
      </div>
    </motion.section>
  );
}

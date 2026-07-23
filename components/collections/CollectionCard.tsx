"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import { cn } from "@/lib/utils";
import type { Collection } from "@/lib/storage/types";

export function CollectionCard({
  collection,
  featured = false,
  index = 0,
  className = "",
}: {
  collection: Collection;
  featured?: boolean;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glow-border surface-contain group relative",
        featured ? "row-span-2" : "",
        className
      )}
      ref={ref}
    >
      <Link
        href={`/collections/${collection.slug}`}
        className={cn(
          "block h-full overflow-hidden rounded-3xl border border-border-40 bg-surface shadow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-card-hover group-hover:shadow-glow",
          featured ? "rounded-[2rem]" : ""
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            featured ? "aspect-[5/4] sm:aspect-[4/5]" : "aspect-[4/3]"
          )}
        >
          <motion.div style={{ y }} className="absolute inset-0 h-[120%] -top-[10%] w-full">
            <ProtectedImage
              src={`${collection.cover}?size=preview`}
              alt={collection.title}
              fill
              linkWrapped
              sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 50vw"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            />
          </motion.div>
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-500 group-hover:opacity-60"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${collection.accent}, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="label absolute left-4 top-4 rounded-full bg-black/30 px-2.5 py-1 text-white/80">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3
            className={cn(
              "font-semibold text-white drop-shadow",
              featured ? "text-3xl" : "text-xl"
            )}
          >
            {collection.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/75">
            {collection.description}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/60">
            {collection.photos.length} photos
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

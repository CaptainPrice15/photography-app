"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import type { Collection } from "@/lib/storage/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glow-border surface-contain group relative"
    >
      <Link
        href={`/collections/${collection.slug}`}
        className="block overflow-hidden rounded-3xl border border-border-40 bg-surface shadow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-card-hover group-hover:shadow-glow"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <ProtectedImage
            src={collection.cover}
            alt={collection.title}
            fill
            linkWrapped
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            placeholder="blur"
            blurDataURL={collection.photos[0]?.blurDataURL}
          />
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-500 group-hover:opacity-60"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${collection.accent}, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-semibold text-white drop-shadow">
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

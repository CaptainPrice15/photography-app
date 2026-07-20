"use client";

import { motion } from "framer-motion";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import type { Photo } from "@/lib/storage/types";
import { FavoriteButton } from "./FavoriteButton";
import { BuyButton } from "./BuyButton";

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
  sizes?: string;
  priority?: boolean;
}

export function PhotoCard({ photo, onOpen, sizes, priority }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Open ${photo.title ?? photo.alt}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group surface-contain relative mb-4 block w-full overflow-hidden rounded-2xl border border-border-40 bg-surface shadow-card transition-shadow duration-300 hover:shadow-card-hover hover:shadow-glow-sm"
    >
      <div className="overflow-hidden">
        <ProtectedImage
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          unoptimized={photo.unoptimized}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          priority={priority}
          className="h-auto w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute top-0 right-0 p-3 opacity-0 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 group-hover:opacity-100 flex gap-2">
        <FavoriteButton photoId={photo.id} />
        <BuyButton photoId={photo.id} title={photo.title || "Photo"} />
      </div>

      {photo.title && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="glass-strong inline-block rounded-xl px-3 py-1.5">
            <span className="text-sm font-medium text-fg">{photo.title}</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}

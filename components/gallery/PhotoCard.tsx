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

const child = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function PhotoCard({ photo, onOpen, sizes, priority }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Open ${photo.title ?? photo.alt}`}
      variants={child}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      whileHover={{ y: -6 }}
      className="group surface-contain relative mb-4 block w-full overflow-hidden rounded-2xl bg-transparent transition-shadow duration-300 hover:shadow-card-hover hover:shadow-glow-sm"
    >
      <div className="overflow-hidden rounded-2xl">
        <ProtectedImage
          src={`${photo.src}?size=thumb`}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"}
          priority={priority}
          className="h-auto w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Focus-frame draw on hover */}
      <span className="pointer-events-none absolute inset-2 rounded-xl border border-accent/0 transition-all duration-300 group-hover:border-accent/40" />

      {/* Bottom gradient */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top-right actions: staggered */}
      <div className="absolute right-3 top-3 flex gap-2">
        <motion.span
          initial={false}
          className="opacity-0 transition-all duration-300 [transition-delay:0ms] group-hover:opacity-100 group-hover:[transition-delay:60ms]"
        >
          <FavoriteButton photoId={photo.id} />
        </motion.span>
        <motion.span
          initial={false}
          className="opacity-0 transition-all duration-300 [transition-delay:0ms] group-hover:opacity-100 group-hover:[transition-delay:140ms]"
        >
          <BuyButton photoId={photo.id} title={photo.title || "Photo"} />
        </motion.span>
      </div>

      {/* Title capsule bottom-left */}
      {photo.title && (
        <div className="pointer-events-none absolute bottom-3 left-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="glass-strong inline-block rounded-full px-3 py-1.5 text-sm font-medium text-fg">
            {photo.title}
          </span>
        </div>
      )}
    </motion.button>
  );
}
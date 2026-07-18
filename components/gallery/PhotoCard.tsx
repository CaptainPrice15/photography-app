"use client";

import Image from "next/image";
import type { Photo } from "@/lib/storage/types";

interface Props {
  photo: Photo;
  onOpen: (photo: Photo) => void;
  sizes?: string;
  priority?: boolean;
}

export function PhotoCard({ photo, onOpen, sizes, priority }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-border bg-surface"
      aria-label={`Open ${photo.title ?? photo.alt}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        unoptimized={photo.unoptimized}
        placeholder={photo.blurDataURL ? "blur" : "empty"}
        blurDataURL={photo.blurDataURL}
        sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        priority={priority}
        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {photo.title && (
        <span className="pointer-events-none absolute bottom-3 left-3 right-3 translate-y-2 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {photo.title}
        </span>
      )}
    </button>
  );
}

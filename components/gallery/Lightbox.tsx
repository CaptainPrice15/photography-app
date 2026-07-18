"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import type { Photo } from "@/lib/storage/types";

interface Props {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      const next = (index + dir + photos.length) % photos.length;
      setDirection(dir);
      onNavigate(next);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, go, onClose]);

  const photo = index !== null ? photos[index] : null;

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)",
          }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="glass-strong absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-white transition-all duration-200 hover:shadow-glow"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <button
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="glass-strong absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition-all duration-200 hover:shadow-glow sm:left-6"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="glass-strong absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition-all duration-200 hover:shadow-glow sm:right-6"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={photo.id}
              custom={direction}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-4 flex max-h-[88vh] max-w-5xl items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ProtectedImage
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                unoptimized={photo.unoptimized}
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                sizes="100vw"
                className="max-h-[88vh] w-auto rounded-lg object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {photo.title && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-center text-sm text-white/90">
              <span>
                {photo.title}
                <span className="ml-2 text-white/50">
                  {index! + 1} / {photos.length}
                </span>
              </span>
              <a
                href={`/checkout?file=${encodeURIComponent(photo.src.replace(/^\/api\/photos\//, ""))}`}
                className="glass-strong rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:shadow-glow"
              >
                Download original
              </a>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

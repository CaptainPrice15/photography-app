"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";

interface Props {
  photoId: string;
  initialFavorite?: boolean;
}

export function FavoriteButton({ photoId, initialFavorite = false }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setIsFavorite(!isFavorite); // Optimistic UI
    setLoading(true);

    const res = await toggleFavorite(photoId);
    if (res.error) {
      // Revert if error
      setIsFavorite(isFavorite);
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`glass-strong rounded-full p-2.5 transition-all hover:scale-110 active:scale-95 ${
        isFavorite ? "text-accent" : "text-fg hover:text-accent"
      }`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
    </button>
  );
}

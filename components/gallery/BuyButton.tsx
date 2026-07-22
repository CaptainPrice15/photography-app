"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  photoId: string;
  title?: string;
}

export function BuyButton({ photoId, title = "Photo" }: Props) {
  const router = useRouter();

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const params = new URLSearchParams({ photoId, title });
    router.push(`/payment/checkout?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={handleBuy}
      className="glass-strong rounded-full p-2.5 transition-all hover:scale-110 active:scale-95 text-fg hover:text-green-400"
      aria-label="Buy High-Res"
    >
      <ShoppingCart className="h-4 w-4" />
    </button>
  );
}

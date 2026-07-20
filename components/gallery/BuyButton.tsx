"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  photoId: string;
  title?: string;
}

export function BuyButton({ photoId, title = "Photo" }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, title }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        router.push("/login?returnTo=/gallery");
      } else {
        alert("Failed to initiate checkout. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBuy}
      disabled={loading}
      className="glass-strong rounded-full p-2.5 transition-all hover:scale-110 active:scale-95 text-fg hover:text-green-400"
      aria-label="Buy High-Res"
    >
      <ShoppingCart className="h-4 w-4" />
    </button>
  );
}

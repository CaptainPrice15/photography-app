"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const photoId = searchParams.get("photoId") ?? "";
  const title = searchParams.get("title") ?? "Photo";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!photoId || loading) return;
    setLoading(true);
    setError("");

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
        window.location.href = `/login?returnTo=/payment/checkout?photoId=${encodeURIComponent(photoId)}&title=${encodeURIComponent(title)}`;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Complete purchase</h1>
        <p className="mt-2 text-sm text-muted">
          Unlock the full-resolution original file.
        </p>

        <div className="mt-6 rounded-2xl border border-border-40 bg-bg p-5">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium text-fg">{title}</span>
            <span className="text-lg font-semibold">$15.00</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={loading || !photoId}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98] disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" />
          {loading ? "Redirecting to Stripe…" : "Pay with Stripe"}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}

        <p className="mt-4 text-center text-xs text-muted">
          Secure payment processed by Stripe.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-12 max-w-lg p-8 text-center text-muted">Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

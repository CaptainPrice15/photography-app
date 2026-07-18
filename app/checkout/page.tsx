"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { checkoutAction, type CheckoutState } from "@/app/actions/checkout";

function CheckoutInner() {
  const params = useSearchParams();
  const file = params.get("file") ?? "";

  const [, dispatch, isPending] = useActionState(checkoutAction, {
    status: "idle",
    message: "",
  } as CheckoutState);

  return (
    <div className="mx-auto mt-12 max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Unlock full download</h1>
      <p className="mt-2 text-sm text-muted">
        Download the original, full-resolution file. A one-time unlock grants access
        to all downloads for this session.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-bg p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Full-resolution download</span>
          <span className="text-lg font-semibold">$4.99</span>
        </div>
      </div>

      <form action={dispatch} className="mt-6">
        <input type="hidden" name="file" value={file} />
        <button
          type="submit"
          disabled={isPending || !file}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "Processing…" : "Complete payment"}
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">
        Demo checkout — no real charge. Replace <code>checkoutAction</code> with Stripe
        to go live.
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-12 max-w-md p-8">Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserOrders } from "@/app/actions/payment";
import { formatDistanceToNow } from "date-fns";
import { ProtectedImage } from "@/components/shared/ProtectedImage";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments",
  description: "Your payment history and purchases.",
};

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    paid: "bg-green-500/10 text-green-500 border-green-500/20",
    fulfilled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  const cls = colors[status] ?? "bg-muted/10 text-muted border-border-40";
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default async function PaymentPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?returnTo=/payment");
  }

  const orders = await getUserOrders();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <p className="label mb-3">Purchases</p>
        <h1 className="text-h1 font-semibold tracking-tight">Payment history</h1>
        <p className="mt-4 max-w-2xl text-muted">
          {orders.length > 0
            ? `${orders.length} completed ${orders.length === 1 ? "purchase" : "purchases"}.`
            : "Your purchased photos will appear here."}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted">No purchases yet.</p>
          <Link
            href="/gallery"
            className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
          >
            Browse gallery
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="surface-contain flex items-center gap-4 rounded-2xl border border-border-40 bg-surface/50 p-4 shadow-sm sm:gap-6 sm:p-5"
            >
              {order.photo ? (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                  <ProtectedImage
                    src={order.photo.src}
                    alt={order.photo.alt}
                    width={160}
                    height={120}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-2 sm:h-20 sm:w-20">
                  <span className="text-xs text-muted">No image</span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">
                  {order.photo?.title ?? "Photo download"}
                </p>
                <p className="text-sm text-muted">
                  ${(order.amount / 100).toFixed(2)} &middot;{" "}
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="shrink-0">
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

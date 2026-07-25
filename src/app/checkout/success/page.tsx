import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <main className="flex-1 pt-16 flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-h2 font-semibold tracking-tight mb-4">Payment successful!</h1>
        <p className="text-muted mb-8">
          Thank you for your purchase. Your download is now available.
        </p>

        <div className="space-y-4">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border border-border bg-surface px-6 py-3 text-base text-fg hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    </main>
  );
}

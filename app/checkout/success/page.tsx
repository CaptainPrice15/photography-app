import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 text-center min-h-[70vh]">
      <div className="glass max-w-md w-full rounded-3xl p-10 flex flex-col items-center">
        <div className="h-16 w-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-glow">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-fg mb-4">Payment Successful!</h1>
        <p className="text-muted mb-8">
          Thank you for your purchase. Your high-resolution photo is now available for download.
        </p>
        <Link 
          href="/gallery"
          className="bg-accent text-accent-fg font-medium px-6 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Return to Gallery
        </Link>
      </div>
    </div>
  );
}

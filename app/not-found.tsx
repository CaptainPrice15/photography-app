import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-32 text-center">
      <p className="text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted">
        That frame doesn&apos;t exist. Let&apos;s get you back to the gallery.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
      >
        Back home
      </Link>
    </div>
  );
}

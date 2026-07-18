import Link from "next/link";

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "500px", href: "https://500px.com" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row lg:px-8">
        <div className="text-center md:text-left">
          <p className="font-semibold tracking-tight">Lumen</p>
          <p className="text-sm text-muted">Photography, light, and moments worth keeping.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
          <Link href="/gallery" className="hover:text-fg">Gallery</Link>
          <Link href="/collections" className="hover:text-fg">Collections</Link>
          <Link href="/about" className="hover:text-fg">About</Link>
          <Link href="/contact" className="hover:text-fg">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Lumen. All rights reserved.
      </div>
    </footer>
  );
}

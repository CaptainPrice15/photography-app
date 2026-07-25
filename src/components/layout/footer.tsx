import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-25 bg-surface/40 sticky bottom-0 z-10 w-full">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-h3 font-semibold tracking-tight text-fg">Lumen</h3>
            <p className="mt-4 text-muted text-sm leading-relaxed">
              A modern photography showcase. Explore curated collections, a responsive masonry gallery, and the latest work.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h4 className="label mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gallery" className="text-muted transition-colors hover:text-fg">Gallery</Link></li>
              <li><Link href="/collections" className="text-muted transition-colors hover:text-fg">Collections</Link></li>
              <li><Link href="/about" className="text-muted transition-colors hover:text-fg">About</Link></li>
              <li><Link href="/contact" className="text-muted transition-colors hover:text-fg">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-label="Account">
            <h4 className="label mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-muted transition-colors hover:text-fg">Login</Link></li>
              <li><Link href="/signup" className="text-muted transition-colors hover:text-fg">Sign up</Link></li>
              <li><Link href="/favourites" className="text-muted transition-colors hover:text-fg">Favourites</Link></li>
              <li><Link href="/payment" className="text-muted transition-colors hover:text-fg">Purchases</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border-25 pt-8 sm:flex-row">
          <p className="text-sm text-muted">&copy; {year} Lumen. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener" className="text-muted transition-colors hover:text-fg" aria-label="Twitter">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener" className="text-muted transition-colors hover:text-fg" aria-label="Instagram">Instagram</a>
            <a href="https://github.com" target="_blank" rel="noopener" className="text-muted transition-colors hover:text-fg" aria-label="GitHub">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

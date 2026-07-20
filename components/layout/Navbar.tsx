"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/shared/Button";
import { logoutAction } from "@/app/actions/auth";
import type { Session } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex w-full max-w-7xl items-center justify-between rounded-full px-3 py-1.5 sm:px-4 transition-all duration-300",
          scrolled
            ? "glass shadow-card-hover"
            : "border border-transparent bg-transparent"
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full px-2 py-1 font-semibold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-lg shadow-accent/30 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-glow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <span className="text-lg">Lumen</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active ? "text-fg" : "text-muted hover:text-fg"
                )}
              >
                {l.label}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-all duration-300",
                    active
                      ? "scale-100 opacity-100 shadow-glow-sm"
                      : "scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                  )}
                />
              </Link>
            );
          })}
          <div className="mx-1 h-5 w-px bg-border-40" />
          <ThemeToggle />
          <div className="ml-1 flex items-center gap-2">
            {session ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-border bg-surface-65 px-4 py-2 text-sm font-medium backdrop-blur transition-all duration-200 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm focus-glow active:scale-[0.98]"
                >
                  {session.role === "admin" ? "Admin · Log out" : "Log out"}
                </button>
              </form>
            ) : (
              <Button href="/login" size="sm">
                Log in
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-65 text-fg backdrop-blur transition-colors hover:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-elevated fixed inset-0 z-40 flex flex-col px-6 pb-10 pt-24 sm:px-10"
          >
            <nav className="flex flex-col gap-1">
              {links.map((l, i) => {
                const active = isActive(pathname, l.href);
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      delay: 0.08 + 0.06 * i,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block border-b border-border-25 py-4 font-display text-3xl font-semibold tracking-tight transition-colors duration-200",
                        active ? "text-accent" : "text-fg hover:text-accent"
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.08 + 0.06 * links.length, duration: 0.4 }}
              className="mt-auto"
            >
              {session ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-border bg-surface-65 px-4 py-4 text-center text-base font-semibold transition-colors hover:text-accent focus-glow active:scale-[0.98]"
                  >
                    {session.role === "admin" ? "Admin · Log out" : "Log out"}
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98]"
                >
                  Log in
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

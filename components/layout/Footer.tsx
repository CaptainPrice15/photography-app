"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "500px", href: "https://500px.com" },
];

const linkGroups = [
  { title: "Explore", links: [
    { href: "/gallery", label: "Gallery" },
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ] },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Footer() {
  return (
    <footer className="relative mt-28">
      <div className="glass relative mx-auto max-w-7xl rounded-t-3xl border-x-0 border-b-0 border-t border-border-40 px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          className="flex flex-col items-center justify-between gap-8 md:flex-row"
        >
          <motion.div variants={item} className="text-center md:text-left">
            <p className="font-semibold tracking-tight text-lg">Lumen</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Photography, light, and moments worth keeping.
            </p>
          </motion.div>

          <motion.nav
            variants={item}
            className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted"
          >
            {linkGroups[0].links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="underline-draw transition-colors hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </motion.nav>

          <motion.div variants={item} className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="ext-link flex items-center gap-1 rounded-full border border-border-40 bg-surface-65 px-3 py-1.5 text-xs font-medium text-muted transition-all duration-200 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm"
              >
                {s.label}
                <svg
                  className="ext-arrow"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
          </motion.div>
        </motion.div>

        <div className="mt-10 border-t border-border-40 pt-5 text-center text-xs text-muted">
          © {new Date().getFullYear()} Lumen. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

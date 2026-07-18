import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "The photographer behind Lumen — bio, gear, and approach.",
};

const gear = [
  "Sony A7 IV",
  "35mm f/1.4 GM",
  "85mm f/1.8",
  "DJI Mini 3 Pro",
  "Lightroom + Capture One",
];

const stats = [
  { value: "12+", label: "Years shooting" },
  { value: "40+", label: "Countries" },
  { value: "30k", label: "Frames archived" },
  { value: "4", label: "Active series" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-surface">
          <Image
            src="/photos/bloom/bloom-1.jpg"
            alt="Portrait of the photographer"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg=="
          />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            About
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Light is the only subject.
          </h1>
          <p className="mt-4 text-muted">
            I&apos;m a photographer drawn to quiet moments and strong color — from
            northern lights to golden-hour streets. Lumen is where I collect the work
            that stays with me.
          </p>
          <p className="mt-3 text-muted">
            Every series here has its own palette, and the site shifts to match it. Take
            your time, open a collection, and let it set the mood.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Get in touch
            </Link>
            <Link
              href="/gallery"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface"
            >
              View gallery
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-surface/60 p-5 text-center"
          >
            <p className="text-3xl font-semibold text-accent">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">Gear I trust</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {gear.map((g) => (
            <li
              key={g}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photoSource } from "@/lib/storage";
import { SectionReveal, RevealItem } from "@/components/shared/SectionReveal";
import { CountUp } from "@/components/shared/CountUp";
import { TextReveal } from "@/components/shared/TextReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";

export const metadata: Metadata = {
  title: "About",
  description: "The photographer behind Lumen — bio, gear, and approach.",
};

export const dynamic = "force-dynamic";

const gear = [
  "Sony A7 IV",
  "35mm f/1.4 GM",
  "85mm f/1.8",
  "DJI Mini 3 Pro",
  "Lightroom + Capture One",
];

const stats = [
  { value: 12, suffix: "+", label: "Years shooting" },
  { value: 40, suffix: "+", label: "Countries" },
  { value: 30, suffix: "k", label: "Frames archived" },
  { value: 4, label: "Active series" },
];

export default async function AboutPage() {
  const collection = await photoSource.getCollection("bloom");
  const cover = collection?.photos[0];
  const coverSrc = cover?.src ?? "/photos/bloom/bloom-1.jpg";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionReveal stagger className="grid items-center gap-10 md:grid-cols-2">
        <RevealItem className="relative z-10 aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-surface md:-mr-16 md:mt-16">
          <div className="animate-float h-full w-full">
            <Image
              src={coverSrc}
              alt="Portrait of the photographer"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              placeholder={cover?.blurDataURL ? "blur" : "empty"}
              blurDataURL={cover?.blurDataURL}
            />
          </div>
        </RevealItem>
        <RevealItem className="relative">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            About
          </p>
          <TextReveal as="h1" className="mt-3 text-h1 font-semibold tracking-tight">
            Light is the only subject.
          </TextReveal>
          <p className="mt-5 text-muted">
            I&apos;m a photographer drawn to quiet moments and strong color — from
            northern lights to golden-hour streets. Lumen is where I collect the
            work that stays with me.
          </p>
          <p className="mt-3 text-muted">
            Every series here has its own palette, and the site shifts to match it.
            Take your time, open a collection, and let it set the mood.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <MagneticButton
              as="a"
              href="/contact"
              strength={12}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition-shadow hover:shadow-glow focus-glow"
            >
              Get in touch
            </MagneticButton>
            <Link
              href="/gallery"
              className="rounded-full border border-border bg-surface-65 px-5 py-2.5 text-sm font-semibold text-fg backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm focus-glow active:scale-[0.98]"
            >
              View gallery
            </Link>
          </div>
        </RevealItem>
      </SectionReveal>

      <SectionReveal
        stagger
        className="mt-20 flex flex-wrap gap-x-10 gap-y-6 border-y border-border-25 py-10"
      >
        {stats.map((s) => (
          <RevealItem key={s.label} className="flex min-w-[120px] flex-col">
            <p className="text-4xl font-semibold tracking-tight text-fg">
              <CountUp value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted">
              {s.label}
            </p>
          </RevealItem>
        ))}
      </SectionReveal>

      <SectionReveal stagger className="mt-16">
        <RevealItem>
          <h2 className="text-2xl font-semibold tracking-tight">Gear I trust</h2>
        </RevealItem>
        <ul className="mt-5 flex flex-wrap gap-3">
          {gear.map((g) => (
            <RevealItem
              key={g}
              as="li"
              className="rounded-full border border-border-40 bg-surface/60 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-fg"
            >
              {g}
            </RevealItem>
          ))}
        </ul>
      </SectionReveal>
    </div>
  );
}

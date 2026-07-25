'use client';

import { TextReveal } from '@/components/ui/text-reveal';
import { CountUp } from '@/components/ui/count-up';

export default function AboutPage() {
  return (
    <main className="flex-1 pt-16">
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <TextReveal split>
          <h1 className="text-display font-semibold tracking-tight mb-6">About</h1>
        </TextReveal>
        <TextReveal split>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            Lumen is a photography portfolio showcasing curated collections, a responsive masonry gallery,
            and the latest work. Light is the only subject.
          </p>
        </TextReveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center p-8 rounded-xl bg-surface block border-border-25">
            <CountUp value={50} suffix="+" duration={2000} className="text-4xl font-bold font-display" />
            <p className="text-muted mt-2">Collections</p>
          </div>
          <div className="text-center p-8 rounded-xl bg-surface block border-border-25">
            <CountUp value={500} suffix="+" duration={2000} className="text-4xl font-bold font-display" />
            <p className="text-muted mt-2">Photos</p>
          </div>
          <div className="text-center p-8 rounded-xl bg-surface block border-border-25">
            <CountUp value={5} suffix="+" duration={2000} className="text-4xl font-bold font-display" />
            <p className="text-muted mt-2">Years</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-surface border border-border-25 p-8 sm:p-12">
          <div className="max-w-3xl">
            <TextReveal split>
              <h2 className="text-h2 font-semibold tracking-tight mb-6">The gear behind the lens</h2>
            </TextReveal>
            <TextReveal split>
              <ul className="space-y-3 text-muted">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  Sony A7 III — Full-frame mirrorless
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  Sony FE 24-105mm f/4 G OSS
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  Sony FE 50mm f/1.8
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  DJI Mini 4 Pro — Aerial photography
                </li>
              </ul>
            </TextReveal>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionReveal } from "@/components/shared/SectionReveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about commissions, prints, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionReveal as="header" className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Contact
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Let&apos;s work together
        </h1>
        <p className="mt-3 text-muted">
          Commissions, prints, or just a hello — drop a note and I&apos;ll reply
          within a couple of days.
        </p>
      </SectionReveal>

      <SectionReveal className="rounded-3xl border border-border bg-surface/50 p-6 shadow-card sm:p-8">
        <ContactForm />
      </SectionReveal>
    </div>
  );
}

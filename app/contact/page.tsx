import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionReveal, RevealItem } from "@/components/shared/SectionReveal";
import { TextReveal } from "@/components/shared/TextReveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about commissions, prints, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <SectionReveal className="order-2 md:order-1">
          <div className="glass-elevated rounded-3xl p-6 shadow-card sm:p-8">
            <ContactForm />
          </div>
        </SectionReveal>

        <SectionReveal stagger className="order-1 md:order-2">
          <RevealItem>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">
              Contact
            </p>
          </RevealItem>
          <RevealItem>
            <TextReveal as="h1" className="mt-3 text-h1 font-semibold tracking-tight">
              Let&apos;s work together
            </TextReveal>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 max-w-md text-muted">
              Commissions, prints, or just a hello — drop a note and I&apos;ll reply
              within a couple of days.
            </p>
          </RevealItem>
        </SectionReveal>
      </div>
    </div>
  );
}

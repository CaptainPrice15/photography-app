"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle", message: "" };

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function FloatingField({
  id,
  name,
  label,
  type = "text",
  textarea = false,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const common = (
    <>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          required={required}
          rows={5}
          placeholder=" "
          className="peer w-full rounded-xl border border-border bg-surface/60 px-4 pt-6 pb-2 text-fg outline-none transition-colors placeholder:text-transparent focus:border-accent focus:shadow-glow-sm resize-none"
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder=" "
          className="peer w-full rounded-xl border border-border bg-surface/60 px-4 pt-6 pb-2 text-fg outline-none transition-colors placeholder:text-transparent focus:border-accent focus:shadow-glow-sm"
        />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 text-sm text-muted transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </>
  );

  return (
    <motion.div variants={fieldVariants} className="relative">
      {common}
    </motion.div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  return (
    <motion.form
      action={formAction}
      className="flex flex-col gap-5"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingField id="name" name="name" label="Name" required />
        <FloatingField id="email" name="email" type="email" label="Email" required />
      </div>
      <FloatingField id="subject" name="subject" label="Subject" />
      <FloatingField id="message" name="message" label="Message" textarea required />

      {state.status === "error" && (
        <AnimatePresence mode="wait">
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-red-500"
          >
            {state.message}
          </motion.p>
        </AnimatePresence>
      )}
      {state.status === "success" && (
        <AnimatePresence mode="wait">
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-green-500"
          >
            {state.message}
          </motion.p>
        </AnimatePresence>
      )}

      <button
        type="submit"
        disabled={pending}
        className="relative overflow-hidden self-start rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow focus-glow active:scale-[0.98] disabled:opacity-60"
      >
        {pending && (
          <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        {pending ? "Sending…" : "Send Message"}
      </button>
    </motion.form>
  );
}

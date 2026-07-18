"use client";

import { useActionState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactState = { status: "idle", message: "" };

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function Field({
  label,
  reduce,
  children,
}: {
  label: string;
  reduce: boolean | null;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </>
  );
  if (reduce) return <div>{inner}</div>;
  return <motion.div variants={fieldVariants}>{inner}</motion.div>;
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const reduce = useReducedMotion();

  const fieldClass =
    "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted focus:border-accent focus:shadow-glow-sm";

  return (
    <motion.form
      action={formAction}
      className="flex flex-col gap-5"
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <Field reduce={reduce} label="Name">
        <input id="name" name="name" required placeholder="Your name" className={fieldClass} />
      </Field>

      <Field reduce={reduce} label="Email">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={fieldClass}
        />
      </Field>

      <Field reduce={reduce} label="Message">
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project or just say hi."
          className={cn(fieldClass, "resize-none")}
        />
      </Field>

      <motion.div variants={reduce ? undefined : fieldVariants}>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] disabled:opacity-60",
            pending && "cursor-progress"
          )}
        >
          {pending && (
            <span className="absolute inset-0 -z-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          )}
          <span className="relative z-10">{pending ? "Sending…" : "Send message"}</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {state.status !== "idle" && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              state.status === "success"
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-red-500/40 bg-red-500/10 text-red-500"
            )}
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

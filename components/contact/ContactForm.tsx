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

function FloatingField({
  id,
  name,
  label,
  type = "text",
  textarea = false,
  required,
  reduce,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  reduce: boolean | null;
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

  if (reduce) return <div className="relative">{common}</div>;
  return (
    <motion.div variants={fieldVariants} className="relative">
      {common}
    </motion.div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const reduce = useReducedMotion();

  return (
    <motion.form
      action={formAction}
      className="flex flex-col gap-5"
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "show"}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <FloatingField id="name" name="name" label="Name" required reduce={reduce} />
      <FloatingField
        id="email"
        name="email"
        label="Email"
        type="email"
        required
        reduce={reduce}
      />
      <FloatingField
        id="message"
        name="message"
        label="Message"
        textarea
        required
        reduce={reduce}
      />

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
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
              state.status === "success"
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-red-500/40 bg-red-500/10 text-red-500"
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full text-xs font-bold",
                state.status === "success"
                  ? "bg-accent/20"
                  : "bg-red-500/20"
              )}
            >
              {state.status === "success" ? "✓" : "!"}
            </span>
            {state.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

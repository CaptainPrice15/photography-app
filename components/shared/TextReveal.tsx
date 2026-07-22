"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  /** Per-line stagger in seconds. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** When true, animates each line separately (split on newlines). */
  split?: boolean;
}

const container = {
  hidden: {},
  show: (delay: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
};

const line = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * Editorial text reveal: clips each line and slides it up from below the mask.
 * Wrap headlines in this for a premium "unveil" entrance. Falls back to plain
 * text under prefers-reduced-motion.
 */
export function TextReveal({
  children,
  className,
  delay = 0,
  as = "div",
  split = false,
}: TextRevealProps) {
  const Tag = motion[as];

  if (split && typeof children === "string") {
    const lines = children.split("\n");
    return (
      <Tag
        className={cn(className)}
        variants={container}
        custom={delay}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {lines.map((l, i) => (
          <span key={i} className="block overflow-hidden">
            <motion.span variants={line} className="block will-change-transform">
              {l}
            </motion.span>
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn("overflow-hidden", className)}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.span variants={line} className="block will-change-transform">
        {children}
      </motion.span>
    </Tag>
  );
}

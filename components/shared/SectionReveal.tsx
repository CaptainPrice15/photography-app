"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Stagger children that use the `reveal-item` variant. */
  stagger?: boolean;
  /** Delay before the reveal starts (seconds). */
  delay?: number;
  as?: "div" | "section" | "header" | "li" | "article";
}

/**
 * Reveals content once when ~15% visible. Wrap a section, or pass `stagger`
 * and use <RevealItem> children for sequenced entrance.
 */
export function SectionReveal({
  children,
  className,
  style,
  stagger = false,
  delay = 0,
  as = "div",
}: SectionRevealProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: {
          transition: stagger
            ? { delayChildren: delay, staggerChildren: 0.08 }
            : { delay },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "header";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}

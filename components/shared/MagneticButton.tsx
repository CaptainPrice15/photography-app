"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** How far the element is allowed to drift toward the cursor (px). */
  strength?: number;
  as?: "button" | "a" | "div";
  href?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

/**
 * CSS-free magnetic hover: the element follows the cursor within `strength` px
 * using a spring, then settles back on leave. GPU-only transform, no JS
 * mousemove binding. Disabled under prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  className,
  strength = 10,
  as = "button",
  href,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} {...(href ? { href } : {})} onClick={onClick} {...rest}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      className={cn("inline-flex will-change-transform", className)}
      {...(href ? { href } : {})}
      onClick={onClick}
      whileHover={{
        x: strength * 0.35,
        y: strength * 0.35,
        transition: { type: "spring", stiffness: 200, damping: 12 },
      }}
      whileTap={{ scale: 0.97 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

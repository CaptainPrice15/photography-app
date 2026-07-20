"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxImageProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px across the scroll range. */
  distance?: number;
  as?: "div" | "section" | "header";
}

/**
 * Scroll-linked parallax wrapper. The inner content translates on the Y axis as
 * the element passes through the viewport, creating subtle depth behind
 * foreground UI. GPU-only transform; disabled under prefers-reduced-motion.
 */
export function ParallaxImage({
  children,
  className,
  distance = 60,
  as = "div",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const Tag = motion[as];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance * -0.5, distance * 0.5]);

  if (reduce) {
    const Plain = as;
    return (
      <Plain ref={ref as never} className={className}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag ref={ref} className={cn("relative", className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </Tag>
  );
}

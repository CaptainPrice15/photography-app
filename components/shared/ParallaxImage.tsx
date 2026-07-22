"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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

export function ParallaxImage({
  children,
  className,
  distance = 60,
  as = "div",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = motion[as];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance * -0.5, distance * 0.5]);

  return (
    <Tag ref={ref} className={cn("relative", className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </Tag>
  );
}

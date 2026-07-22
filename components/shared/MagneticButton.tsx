"use client";

import { motion } from "framer-motion";
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

export function MagneticButton({
  children,
  className,
  strength = 10,
  as = "button",
  href,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const Tag = motion[as];

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

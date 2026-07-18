"use client";

import { MotionConfig } from "framer-motion";

interface MotionProviderProps {
  children: React.ReactNode;
}

// Global Framer Motion configuration. reducedMotion="user" automatically
// disables motion for users who have requested reduced motion at the OS level.
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

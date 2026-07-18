"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-all duration-200 ease-out focus-glow active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-lg shadow-accent/30 hover:-translate-y-0.5 hover:shadow-glow",
  secondary:
    "border border-border bg-surface-65 text-fg backdrop-blur hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm",
  ghost:
    "text-muted hover:text-fg hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-2.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AnchorProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | AnchorProps>(
  function Button({ variant = "primary", size = "md", className, ...props }, ref) {
    const classes = cn(base, variants[variant], sizes[size], className);

    if ("href" in props && props.href !== undefined) {
      const { href, ...rest } = props as AnchorProps;
      const external = href.startsWith("http");
      return (
        <Link
          href={href}
          className={classes}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          {...rest}
        >
          {(props as AnchorProps).children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...(props as ButtonProps)}>
        {(props as ButtonProps).children}
      </button>
    );
  }
);

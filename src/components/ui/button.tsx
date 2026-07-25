'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  className?: string;
  onClick?: () => void;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-border bg-surface px-4 py-2 text-sm text-fg hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-glow-sm',
  secondary:
    'border border-border bg-transparent px-4 py-2 text-sm text-muted hover:bg-surface hover:text-fg hover:border-border-40',
  ghost: 'border-none bg-transparent px-4 py-2 text-sm text-muted hover:text-fg hover:bg-surface/50',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  href,
  className,
  onClick,
}: ButtonProps) {
  const classes = twMerge(
    clsx(
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
      variants[variant],
      sizes[size],
      className
    )
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

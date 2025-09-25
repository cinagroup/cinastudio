"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "bg-transparent text-primary hover:bg-primary/10",
} as const;

type ButtonVariant = keyof typeof variants;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function buttonStyles(variant: ButtonVariant = "default", className?: string) {
  return cn(baseStyles, variants[variant], className);
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}

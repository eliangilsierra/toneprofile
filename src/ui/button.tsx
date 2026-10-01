import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// `pressable`: L1 press feedback (scale 0.98). Primary buttons also get the `sheen` — a single pass
// of light on hover, like signal crossing the control (fine pointers only; see globals.css).
const base =
  "pressable inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium select-none " +
  "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "sheen bg-signal text-signal-ink hover:bg-signal-strong",
  secondary: "border border-line-strong bg-surface-2 text-ink hover:border-ink-faint hover:bg-surface-3",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "border border-danger/50 text-danger hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

/** Locale-aware link styled as a button. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

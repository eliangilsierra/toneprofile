import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "./cn";

/** Label + control + hint/error, wired with ids for aria-describedby. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="label !text-ink-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses =
  "h-11 w-full rounded-sm border border-line-strong bg-surface-1 px-3 text-[0.9375rem] text-ink " +
  "placeholder:text-ink-faint transition-colors duration-[var(--duration-fast)] " +
  "hover:border-ink-faint focus-visible:border-signal focus-visible:outline-none aria-invalid:border-danger";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(controlClasses, "appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M5 8l5 5 5-5" />
      </svg>
    </div>
  );
}

import { cn } from "./cn";

/**
 * Segmented meter (LED-ladder style) for 0–1 values. Exposes role="meter" so the value is available
 * to assistive tech; the visual is decorative.
 */
export function Meter({
  value,
  label,
  valueText,
  segments = 12,
  tone = "signal",
  className,
}: {
  value: number;
  label: string;
  valueText: string;
  segments?: number;
  tone?: "signal" | "measure" | "muted";
  className?: string;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  const lit = Math.round(clamped * segments);
  const litClass = tone === "signal" ? "bg-signal" : tone === "measure" ? "bg-measure" : "bg-ink-faint";
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuetext={valueText}
      className={cn("flex h-2.5 gap-[3px]", className)}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          className={cn("h-full flex-1 rounded-[1px]", index < lit ? litClass : "bg-surface-3")}
        />
      ))}
    </div>
  );
}

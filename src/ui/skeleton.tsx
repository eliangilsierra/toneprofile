import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-sm bg-surface-2 animate-[signal-breathe_2.4s_ease-in-out_infinite]", className)} />;
}

/** Generic loading layout; the live region tells assistive tech something is loading. */
export function PageSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

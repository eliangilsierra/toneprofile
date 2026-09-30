import { useTranslations } from "next-intl";
import type { GenerationStatus } from "@/lib/api/types";
import { cn } from "./cn";

const tone: Record<GenerationStatus, string> = {
  queued: "text-ink-muted border-line-strong",
  running: "text-signal border-signal/40",
  ready: "text-ok border-ok/40",
  failed: "text-danger border-danger/40",
  cancelled: "text-ink-faint border-line",
};

export function StatusChip({ status }: { status: GenerationStatus }) {
  const t = useTranslations("Status");
  return (
    <span className={cn("label inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5", tone[status])}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full bg-current",
          status === "running" && "animate-[signal-breathe_2.4s_ease-in-out_infinite]",
        )}
      />
      {t(status)}
    </span>
  );
}

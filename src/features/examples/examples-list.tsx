"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toApiError } from "@/lib/api/errors";
import type { ExampleSummary } from "@/lib/api/types";
import { Button } from "@/ui/button";
import { ArrowRight } from "@/ui/icons";
import { Meter } from "@/ui/meter";
import { Skeleton } from "@/ui/skeleton";
import { ProblemState } from "@/features/shell/problem-state";
import { useExamples } from "./queries";

function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "measure" | "warn" }) {
  const toneClass =
    tone === "measure" ? "border-measure/40 text-measure" : tone === "warn" ? "border-warn/40 text-warn" : "border-line-strong text-ink-muted";
  return <span className={`rounded-xs border px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em] ${toneClass}`}>{children}</span>;
}

function ExampleCard({ example }: { example: ExampleSummary }) {
  const t = useTranslations("Examples.card");
  const tax = useTranslations("Taxonomy");
  const tprof = useTranslations("Profile");
  const tc = useTranslations("Common");
  return (
    <Link
      href={`/examples/${example.slug}`}
      className="group flex h-full flex-col gap-5 rounded-md border border-line bg-surface-1/50 p-5 transition-colors hover:border-line-strong hover:bg-surface-2 md:p-6"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{example.song.title}</h2>
        <p className="text-ink-muted">{example.song.artist}</p>
      </div>
      <p className="flex-1 leading-relaxed text-ink-muted">{example.headline}</p>
      <div className="flex flex-wrap gap-2">
        {example.has_reference_audio ? <Badge tone="measure">{t("excerpt")}</Badge> : <Badge>{t("researchOnly")}</Badge>}
        {example.gain_class && <Badge>{tax(`gainClass.${example.gain_class}`)}</Badge>}
        {example.warnings.length > 0 && <Badge tone="warn">{t("degraded")}</Badge>}
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
        <div className="flex-1">
          <p className="label">{tprof("overall")}</p>
          <Meter
            className="mt-2 max-w-40"
            value={example.confidence}
            label={tprof("overall")}
            valueText={tc("percent", { value: example.confidence })}
          />
        </div>
        <span className="flex items-center gap-1.5 text-sm text-ink transition-colors group-hover:text-signal">
          {t("open")}
          <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

export function ExamplesList() {
  const t = useTranslations("Examples");
  const tc = useTranslations("Common");
  const { data, isPending, error, refetch } = useExamples();

  if (isPending) {
    return (
      <div role="status" className="grid gap-4 md:grid-cols-3">
        <span className="sr-only">{tc("loading")}</span>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <ProblemState
        code={toApiError(error).code}
        actions={
          <Button variant="secondary" onClick={() => refetch()}>
            {tc("retry")}
          </Button>
        }
      />
    );
  }
  if (data.items.length === 0) return <p className="text-ink-muted">{t("empty")}</p>;
  return (
    <ul aria-label={t("listLabel")} className="grid gap-4 md:grid-cols-3">
      {data.items.map((example) => (
        <li key={example.slug}>
          <ExampleCard example={example} />
        </li>
      ))}
    </ul>
  );
}

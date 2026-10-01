"use client";

import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toApiError } from "@/lib/api/errors";
import { isTerminal, type Generation } from "@/lib/api/types";
import { formatClock, formatDurationShort } from "@/lib/format/time";
import { useWitnessed } from "@/motion/hooks";
import { duration, ease } from "@/motion/tokens";
import { NAV_BACK } from "@/motion/view-transitions";
import { Button, ButtonLink } from "@/ui/button";
import { ArrowLeft, Retry } from "@/ui/icons";
import { PageSkeleton, RailSkeleton } from "@/ui/skeleton";
import { ProblemState } from "@/features/shell/problem-state";
import { ExcerptStrip } from "./excerpt-strip";
import { GenerationHeading, useStations } from "./generation-heading";
import { useCancelGeneration, useGeneration, useRetryGeneration } from "./queries";
import { SignalRail } from "./signal-rail";
import { useNow } from "./use-now";

// The result (charts, d3, feedback) is only needed once a generation is ready.
const ResultView = dynamic(() => import("@/features/result/result-view").then((module) => module.ResultView), {
  loading: () => <PageSkeleton />,
});

/** Announces stage changes to screen readers without repeating on every poll. */
function useLiveAnnouncement(generation: Generation | undefined): string {
  const t = useTranslations("Generation");
  const problem = useTranslations("Problems");
  const [message, setMessage] = useState("");
  const last = useRef<string>("");
  useEffect(() => {
    if (!generation) return;
    const running = generation.steps.find((step) => step.status === "running");
    let next = "";
    if (generation.status === "ready") next = t("live.ready");
    else if (generation.status === "failed" && generation.error) {
      const code = generation.error.code;
      next = t("live.failed", {
        reason: problem.has(`${code}.title` as "internal.title") ? problem(`${code}.title` as "internal.title") : code,
      });
    } else if (running) next = t("live.stepRunning", { step: t(`steps.${running.key}.title`) });
    if (next && next !== last.current) {
      last.current = next;
      setMessage(next);
    }
  }, [generation, t, problem]);
  return message;
}

function FailureActions({ generation, onRetry, retrying }: { generation: Generation; onRetry: () => void; retrying: boolean }) {
  const t = useTranslations("Problems.actions");
  const error = generation.error!;
  return (
    <>
      {error.retryable && (
        <Button onClick={onRetry} disabled={retrying}>
          <Retry />
          {t("retry")}
        </Button>
      )}
      {error.hint === "choose_other_section" && (
        <ButtonLink href="/tones/new" variant="secondary">
          {t("chooseSection")}
        </ButtonLink>
      )}
      {error.hint === "add_excerpt" && (
        <ButtonLink href="/tones/new" variant="secondary">
          {t("addExcerpt")}
        </ButtonLink>
      )}
      <ButtonLink href="/tones/new" variant="ghost">
        {t("newTone")}
      </ButtonLink>
    </>
  );
}

export function GenerationView({ id }: { id: string }) {
  const t = useTranslations("Generation");
  const tc = useTranslations("Common");
  const query = useGeneration(id);
  const cancel = useCancelGeneration(id);
  const retry = useRetryGeneration(id);
  const generation = query.data;
  const terminal = generation ? isTerminal(generation.status) : false;
  const now = useNow(Boolean(generation) && !terminal);
  const announcement = useLiveAnnouncement(generation);
  // Celebrate only a completion the user watched live — not an old result being reopened.
  const arrived = useWitnessed(generation?.status === "ready", Boolean(generation));
  const stations = useStations(generation ?? ({ steps: [] } as unknown as Generation));

  if (query.isPending) return <RailSkeleton label={tc("loading")} />;
  if (query.error || !generation) {
    const error = toApiError(query.error);
    return (
      <ProblemState
        code={error.code}
        actions={
          <>
            {error.retryable && (
              <Button variant="secondary" onClick={() => query.refetch()}>
                {tc("retry")}
              </Button>
            )}
            <ButtonLink href="/tones" variant="ghost">
              {t("backToLibrary")}
            </ButtonLink>
          </>
        }
      />
    );
  }

  const createdAt = Date.parse(generation.created_at);
  const endAt = terminal ? Date.parse(generation.updated_at) : now;
  const elapsed = Math.max(0, (endAt - createdAt) / 1000);

  return (
    <div className="flex flex-col gap-10">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <header className="flex flex-col gap-4">
        <ButtonLink href="/tones" transitionTypes={NAV_BACK} variant="ghost" size="sm" className="no-print -ml-3 w-fit">
          <ArrowLeft />
          {t("backToLibrary")}
        </ButtonLink>
        <GenerationHeading generation={generation} />
        <ExcerptStrip generation={generation} />
      </header>

      <section aria-label={t("railLabel")} className="relative overflow-hidden rounded-md border border-line bg-surface-1/50 p-5 md:p-7">
        {arrived && (
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-signal/12 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: duration.signal * 1.4, ease: ease.standard }}
          />
        )}
        <SignalRail stations={stations} label={t("railLabel")} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="font-mono text-xs text-ink-muted tabular">
            {t("elapsed", { time: formatClock(elapsed) })}
            {!terminal && (
              <span className="text-ink-faint">
                {" · "}
                {t("typical", {
                  p50: formatDurationShort(generation.estimate.p50_s),
                  p90: formatDurationShort(generation.estimate.p90_s),
                })}
              </span>
            )}
          </p>
          {!terminal && (
            <Button variant="ghost" size="sm" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
              {cancel.isPending ? t("cancelling") : t("cancel")}
            </Button>
          )}
        </div>
        {!terminal && elapsed > generation.estimate.p90_s && (
          <p className="mt-3 text-sm text-warn" role="status">
            {t("slower")}
          </p>
        )}
      </section>

      {/* Problems arrive from the rail above: where the signal stopped → why → how to recover. */}
      {generation.status === "failed" && generation.error && (
        <m.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }}>
          <ProblemState
            code={generation.error.code}
            actions={<FailureActions generation={generation} onRetry={() => retry.mutate()} retrying={retry.isPending} />}
          />
        </m.div>
      )}

      {generation.status === "cancelled" && (
        <m.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out }}
          className="rounded-md border border-line-strong bg-surface-1 p-6"
        >
          <h2 className="text-lg font-medium">{t("cancelled.title")}</h2>
          <p className="mt-1 text-ink-muted">{t("cancelled.body")}</p>
          <ButtonLink href="/tones/new" variant="secondary" className="mt-5">
            {t("startOver")}
          </ButtonLink>
        </m.div>
      )}

      {generation.status === "ready" && generation.result && (
        <ResultView generation={generation} variant="tone" sheetHref={`/tones/${generation.id}/sheet`} />
      )}
    </div>
  );
}

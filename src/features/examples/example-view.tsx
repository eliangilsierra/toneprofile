"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toApiError } from "@/lib/api/errors";
import { Button, ButtonLink } from "@/ui/button";
import { ArrowLeft, ArrowRight, Info } from "@/ui/icons";
import { PageSkeleton } from "@/ui/skeleton";
import { GenerationHeading, useStations } from "@/features/generation/generation-heading";
import { useGeneration } from "@/features/generation/queries";
import { SignalRail } from "@/features/generation/signal-rail";
import { DialInSheet } from "@/features/preset/dial-in-sheet";
import { ProblemState } from "@/features/shell/problem-state";
import type { Generation } from "@/lib/api/types";
import { useExample } from "./queries";

const ResultView = dynamic(() => import("@/features/result/result-view").then((module) => module.ResultView), {
  loading: () => <PageSkeleton />,
});

function FinishedRail({ generation }: { generation: Generation }) {
  const t = useTranslations("Generation");
  const stations = useStations(generation);
  return (
    <section aria-label={t("railLabel")} className="rounded-md border border-line bg-surface-1/50 p-5 md:p-7">
      <SignalRail stations={stations} label={t("railLabel")} />
    </section>
  );
}

function BackLink() {
  const t = useTranslations("Examples.detail");
  return (
    <ButtonLink href="/examples" variant="ghost" size="sm" className="no-print -ml-3 w-fit">
      <ArrowLeft />
      {t("back")}
    </ButtonLink>
  );
}

/** Dial-in sheet of an example (the generation id depends on the locale, so resolve it first). */
export function ExampleSheet({ slug }: { slug: string }) {
  const tc = useTranslations("Common");
  const example = useExample(slug);
  if (example.isPending) return <PageSkeleton label={tc("loading")} />;
  if (example.error) {
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <ProblemState code={toApiError(example.error).code} />
      </div>
    );
  }
  return <DialInSheet generationId={example.data.generation_id} backHref={`/examples/${slug}`} />;
}

/** A curated example: the finished pipeline and the complete, read-only result. */
export function ExampleView({ slug }: { slug: string }) {
  const t = useTranslations("Examples.detail");
  const tc = useTranslations("Common");
  const example = useExample(slug);
  const generation = useGeneration(example.data?.generation_id ?? "", { enabled: Boolean(example.data) });
  const loading = example.isPending || (example.data && generation.isPending);

  if (loading) return <PageSkeleton label={tc("loading")} />;
  const failure = example.error ?? generation.error;
  if (failure || !generation.data) {
    const error = toApiError(failure);
    return (
      <div className="flex flex-col gap-6">
        <BackLink />
        <ProblemState
          code={failure ? error.code : "not_found"}
          actions={
            error.retryable ? (
              <Button variant="secondary" onClick={() => void example.refetch()}>
                {tc("retry")}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const data = generation.data;
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <BackLink />
        <GenerationHeading generation={data} eyebrow={t("eyebrow")} />
        <p className="flex max-w-3xl items-start gap-2 text-sm text-ink-muted">
          <Info className="mt-0.5 shrink-0 text-measure" />
          {t("note")}
        </p>
      </header>

      <FinishedRail generation={data} />

      {data.status === "ready" && data.result && (
        <ResultView generation={data} variant="example" sheetHref={`/examples/${slug}/sheet`} />
      )}

      <section className="no-print bg-grid flex flex-col items-start gap-6 rounded-md border border-line p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <h2 className="max-w-[20ch] font-serif text-3xl md:text-4xl">{t("ctaTitle")}</h2>
        <ButtonLink href="/tones/new" size="lg">
          {t("cta")}
          <ArrowRight />
        </ButtonLink>
      </section>
    </div>
  );
}

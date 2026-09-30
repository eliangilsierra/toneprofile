"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toApiError } from "@/lib/api/errors";
import { Button, ButtonLink } from "@/ui/button";
import { ArrowRight, Waveform } from "@/ui/icons";
import { Skeleton } from "@/ui/skeleton";
import { StatusChip } from "@/ui/status-chip";
import { ProblemState } from "@/features/shell/problem-state";
import { useGenerations } from "./queries";

export function LibraryView() {
  const t = useTranslations("Library");
  const tp = useTranslations("Preset");
  const tc = useTranslations("Common");
  const format = useFormatter();
  const { data, isPending, error, refetch } = useGenerations();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-ink-muted">{t("lede")}</p>
        </div>
      </div>

      <div className="mt-10">
        {isPending ? (
          <div role="status" className="flex flex-col gap-2">
            <span className="sr-only">{tc("loading")}</span>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <ProblemState
            code={toApiError(error).code}
            actions={
              <Button variant="secondary" onClick={() => refetch()}>
                {tc("retry")}
              </Button>
            }
          />
        ) : data.items.length === 0 ? (
          <div className="bg-grid flex flex-col items-start gap-4 rounded-md border border-dashed border-line-strong p-8 md:p-12">
            <Waveform className="size-6 text-signal" />
            <h2 className="text-xl font-medium">{t("empty.title")}</h2>
            <p className="max-w-md text-ink-muted">{t("empty.body")}</p>
            <ButtonLink href="/tones/new">
              {t("empty.cta")}
              <ArrowRight />
            </ButtonLink>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line">
            {data.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/tones/${item.id}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 bg-surface-1/40 px-4 py-4 transition-colors hover:bg-surface-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto_auto] md:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {item.song ? item.song.title : t("noSong")}
                      {item.song && <span className="text-ink-muted"> — {item.song.artist}</span>}
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-xs text-ink-faint">
                      {item.preset_name && <span>{item.preset_name}</span>}
                      {item.has_reference_audio && <span>{t("audioAttached")}</span>}
                    </p>
                  </div>
                  <p className="hidden text-sm text-ink-muted md:block">
                    {tp.has(`deviceNames.${item.device_key}` as "deviceNames.valeton_gp180")
                      ? tp(`deviceNames.${item.device_key}` as "deviceNames.valeton_gp180")
                      : item.device_key}
                  </p>
                  <StatusChip status={item.status} />
                  <p className="col-span-2 text-sm text-ink-faint md:col-span-1 md:text-right">
                    <time dateTime={item.created_at}>
                      {format.relativeTime(new Date(item.created_at), new Date())}
                    </time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

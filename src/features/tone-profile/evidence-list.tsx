"use client";

import { useFormatter, useTranslations } from "next-intl";
import { memo } from "react";
import type { Claim } from "@/lib/api/types";
import { EvidenceMark } from "@/ui/evidence-mark";
import { External } from "@/ui/icons";

/** Gear claims with their evidence level and verifiable sources. */
export const EvidenceList = memo(function EvidenceList({ claims, lang }: { claims: Claim[]; lang?: string }) {
  const t = useTranslations("Profile.evidence");
  const tx = useTranslations("Taxonomy.roles");
  const ts = useTranslations("Evidence.specificity");
  const format = useFormatter();

  if (claims.length === 0) {
    return <p className="rounded-sm border border-dashed border-line-strong p-5 text-ink-muted">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {claims.map((claim) => (
        <li key={claim.id} className="rounded-sm border border-line bg-surface-1/60 p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-baseline gap-3">
              <span className="label">{tx(claim.role)}</span>
              <span className="font-medium text-ink">{claim.item}</span>
            </p>
            <EvidenceMark level={claim.evidence_level} />
          </div>
          <p lang={lang} className="mt-2 leading-relaxed text-ink-muted">
            {claim.statement}
          </p>
          <p className="mt-2 text-xs text-ink-faint">{ts(claim.specificity)}</p>
          {claim.sources.length > 0 && (
            <details className="mt-3 border-t border-line pt-3">
              <summary className="cursor-pointer text-sm text-ink-muted hover:text-ink">
                {t("sources", { count: claim.sources.length })}
              </summary>
              <ul className="mt-3 flex flex-col gap-3">
                {claim.sources.map((source) => (
                  <li key={source.url} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-signal"
                    >
                      {source.title}
                      <External className="size-3.5" />
                      <span className="sr-only">({t("openSource")})</span>
                    </a>
                    <p className="text-xs text-ink-faint">
                      {source.publisher} · {t("retrieved", { date: format.dateTime(new Date(source.retrieved_at), { dateStyle: "medium" }) })}
                    </p>
                    {source.quote_excerpt && (
                      <blockquote className="mt-1.5 border-l-2 border-signal/50 pl-3 text-ink-muted italic">
                        <span className="sr-only">{t("quote")}: </span>“{source.quote_excerpt}”
                      </blockquote>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
});

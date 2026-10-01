"use client";

import { useTranslations } from "next-intl";
import { toApiError } from "@/lib/api/errors";
import { formatParamValue } from "@/lib/format/params";
import { NAV_BACK, SharedElement, sharedName } from "@/motion/view-transitions";
import { Button, ButtonLink } from "@/ui/button";
import { ArrowLeft, Printer } from "@/ui/icons";
import { PageSkeleton } from "@/ui/skeleton";
import { ProblemState } from "@/features/shell/problem-state";
import { useGeneration, usePresetVersion } from "@/features/generation/queries";

/** Printable settings sheet: the fallback that always works, file import or not. */
export function DialInSheet({ generationId, backHref }: { generationId: string; backHref: string }) {
  const t = useTranslations("Preset");
  const tc = useTranslations("Common");
  const generation = useGeneration(generationId);
  const result = generation.data?.result ?? undefined;
  const version = usePresetVersion(result?.preset_id, result?.preset_version);

  if (generation.isPending || (result && version.isPending)) return <PageSkeleton label={tc("loading")} />;
  if (generation.error || version.error || !result || !version.data) {
    const code = generation.error || version.error ? toApiError(generation.error ?? version.error).code : "not_found";
    return (
      <ProblemState
        code={code}
        actions={
          <ButtonLink href={backHref} variant="secondary">
            {t("sheet.back")}
          </ButtonLink>
        }
      />
    );
  }

  const data = version.data;
  const song = generation.data?.input.song;
  const device = t(`deviceNames.${data.device_key}` as "deviceNames.valeton_gp180");

  return (
    <article className="mx-auto max-w-4xl print:max-w-none">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={backHref} transitionTypes={NAV_BACK} variant="ghost" size="sm" className="-ml-3">
          <ArrowLeft />
          {t("sheet.back")}
        </ButtonLink>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer />
          {tc("print")}
        </Button>
      </div>

      <header className="border-b border-line pb-6 print:border-black">
        <p className="label print:!text-black">{t("sheet.title")}</p>
        <SharedElement name={sharedName("preset", data.preset_id, String(data.version))}>
          <h1 className="mt-2 font-mono text-3xl tracking-tight">{data.name}</h1>
        </SharedElement>
        <p className="mt-2 text-ink-muted print:text-black">
          {t("sheet.generatedFor", { song: song ? `${song.title} — ${song.artist}` : "—", device, version: data.version })}
        </p>
        <p className="mt-3 max-w-prose text-sm text-ink-muted print:text-black">{t("sheet.lede")}</p>
        <p className="mt-3 font-mono text-sm">
          {t("patchVolume")}: {data.patch_volume}
          {data.bpm ? ` · BPM ${data.bpm}` : ""}
        </p>
      </header>

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="label border-b border-line-strong print:!text-black">
            <th scope="col" className="w-20 py-2 font-normal">
              {t("sheet.slot")}
            </th>
            <th scope="col" className="w-44 py-2 font-normal">
              {t("sheet.model")}
            </th>
            <th scope="col" className="py-2 font-normal">
              {t("sheet.settings")}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.chain.map((block) => (
            <tr key={block.slot} className="border-b border-line align-top print:border-gray-400">
              <th scope="row" className={`py-3 font-mono text-sm ${block.enabled ? "text-signal print:text-black" : "text-ink-faint"}`}>
                {block.slot}
              </th>
              <td className="py-3">{block.enabled ? block.model.name : <span className="text-ink-faint">{t("sheet.disabled")}</span>}</td>
              <td className="py-3 font-mono text-sm tabular">
                {block.enabled
                  ? block.params.map((param) => (
                      <span key={param.key} className="mr-5 inline-block whitespace-nowrap">
                        <span className="text-ink-muted print:text-gray-600">{param.label}</span> {formatParamValue(param)}
                      </span>
                    ))
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

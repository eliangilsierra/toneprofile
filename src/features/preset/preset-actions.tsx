"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { toApiError } from "@/lib/api/errors";
import type { PresetVersion } from "@/lib/api/types";
import { NAV_FORWARD } from "@/motion/view-transitions";
import { Button, buttonClasses } from "@/ui/button";
import { Check, Close, Download, Printer } from "@/ui/icons";
import { ActionIcon } from "@/ui/action-icon";
import { useProblemCopy } from "@/features/shell/problem-state";
import { downloadPresetFile } from "@/features/generation/queries";

/** Download (or an honest reason why not), dial-in sheet and validation checks. */
export function PresetActions({ version, sheetHref }: { version: PresetVersion; sheetHref: string }) {
  const t = useTranslations("Preset");
  const problemCopy = useProblemCopy();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const filename = version.download.filename ?? `${version.name}.prst`;
  const reason = version.download.reason;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          disabled={!version.download.available || downloading}
          aria-describedby={!version.download.available ? "download-reason" : undefined}
          onClick={async () => {
            setDownloadError(null);
            setDownloading(true);
            try {
              await downloadPresetFile(version.preset_id, version.version, filename);
              setDownloaded(true);
              window.setTimeout(() => setDownloaded(false), 2400);
            } catch (error) {
              setDownloadError(problemCopy(toApiError(error).code).title);
            } finally {
              setDownloading(false);
            }
          }}
        >
          <ActionIcon state={downloading ? "busy" : downloaded ? "done" : "idle"} idle={<Download />} />
          {version.download.available ? t("download.button", { filename }) : t("download.generic")}
        </Button>
        <Link href={sheetHref} transitionTypes={NAV_FORWARD} className={buttonClasses("secondary", "lg")}>
          <Printer />
          {t("sheet.open")}
        </Link>
      </div>
      {!version.download.available && reason && (
        <p id="download-reason" className="max-w-prose text-sm text-ink-muted">
          {t(`download.unavailable.${reason}`)}
        </p>
      )}
      {downloadError && (
        <p role="alert" className="text-sm text-danger">
          {downloadError}
        </p>
      )}

      <div className="rounded-sm border border-line p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          {version.validation.ok ? <Check className="text-ok" /> : <Close className="text-danger" />}
          {version.validation.ok ? t("validation.ok") : t("validation.failed")}
        </p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {version.validation.checks.map((check) => (
            <li key={check.code} className="flex items-start gap-2 text-sm text-ink-muted">
              {check.ok ? <Check className="mt-0.5 shrink-0 text-ok" /> : <Close className="mt-0.5 shrink-0 text-danger" />}
              <span>
                {t(`validation.checks.${check.code}`)}
                <span className="sr-only">: {check.ok ? "OK" : "✗"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const IMPORT_STEPS = ["connect", "slot", "import", "level", "compare"] as const;

export function ImportGuide() {
  const t = useTranslations("Preset.import");
  return (
    <div>
      <h3 className="text-lg font-medium">{t("title")}</h3>
      <ol className="mt-4 flex flex-col gap-3">
        {IMPORT_STEPS.map((step, index) => (
          <li key={step} className="grid grid-cols-[2rem_1fr] gap-2 text-ink-muted">
            <span className="font-mono text-sm text-signal tabular">{String(index + 1).padStart(2, "0")}</span>
            <span className="leading-relaxed">{t(`steps.${step}`)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

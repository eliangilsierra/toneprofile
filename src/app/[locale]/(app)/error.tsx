"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("ErrorPage");
  return (
    <div role="alert" className="rounded-md border border-danger/40 bg-surface-1 p-8">
      <p className="label !text-danger">Error</p>
      <h1 className="mt-2 text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-ink-muted">{t("body")}</p>
      <Button variant="secondary" className="mt-6" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}

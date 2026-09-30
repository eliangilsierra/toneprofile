import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { alternatesFor } from "@/i18n/metadata";
import { ExamplesList } from "@/features/examples/examples-list";
import { Info } from "@/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/examples">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Examples" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: alternatesFor(locale, "/examples") };
}

export default function ExamplesPage({ params }: PageProps<"/[locale]/examples">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Examples");
  return (
    <div className="flex flex-col gap-10">
      <header className="max-w-3xl">
        <p className="label !text-signal">{t("eyebrow")}</p>
        <h1 className="mt-4 font-serif text-headline">{t("title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t("lede")}</p>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
          <Info className="mt-0.5 shrink-0 text-measure" />
          {t("fictional")}
        </p>
      </header>
      <ExamplesList />
    </div>
  );
}

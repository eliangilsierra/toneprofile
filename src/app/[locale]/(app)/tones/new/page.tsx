import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { useTranslations } from "next-intl";
import { alternatesFor } from "@/i18n/metadata";
import { CreateToneForm } from "@/features/create-tone/create-tone-form";

export async function generateMetadata({ params }: PageProps<"/[locale]/tones/new">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "es", namespace: "Create" });
  return { title: t("title"), alternates: alternatesFor(locale, "/tones/new") };
}

export default function NewTonePage({ params }: PageProps<"/[locale]/tones/new">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("Create");
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">{t("lede")}</p>
      <div className="mt-10">
        <CreateToneForm />
      </div>
    </div>
  );
}

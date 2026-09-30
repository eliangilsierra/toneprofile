import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { alternatesFor } from "@/i18n/metadata";
import { ExampleView } from "@/features/examples/example-view";

export async function generateMetadata({ params }: PageProps<"/[locale]/examples/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Examples" });
  return { title: t("metaTitle"), description: t("metaDescription"), alternates: alternatesFor(locale, `/examples/${slug}`) };
}

export default function ExamplePage({ params }: PageProps<"/[locale]/examples/[slug]">) {
  const { locale, slug } = use(params);
  setRequestLocale(locale as Locale);
  return <ExampleView slug={slug} />;
}

import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { PageTransition } from "@/motion/view-transitions";
import { ExampleSheet } from "@/features/examples/example-view";

export async function generateMetadata({ params }: PageProps<"/[locale]/examples/[slug]/sheet">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Preset.sheet" });
  return { title: t("title"), robots: { index: false } };
}

export default function ExampleSheetPage({ params }: PageProps<"/[locale]/examples/[slug]/sheet">) {
  const { locale, slug } = use(params);
  setRequestLocale(locale as Locale);
  return (
    <PageTransition>
      <ExampleSheet slug={slug} />
    </PageTransition>
  );
}

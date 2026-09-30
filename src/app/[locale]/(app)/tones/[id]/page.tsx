import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { use } from "react";
import { GenerationView } from "@/features/generation/generation-view";

export async function generateMetadata({ params }: PageProps<"/[locale]/tones/[id]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "es", namespace: "Generation" });
  return { title: t("title"), robots: { index: false } };
}

export default function GenerationPage({ params }: PageProps<"/[locale]/tones/[id]">) {
  const { id } = use(params);
  return <GenerationView id={id} />;
}

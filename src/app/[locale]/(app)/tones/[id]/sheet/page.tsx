import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { use } from "react";
import { DialInSheet } from "@/features/preset/dial-in-sheet";

export async function generateMetadata({ params }: PageProps<"/[locale]/tones/[id]/sheet">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "es", namespace: "Preset.sheet" });
  return { title: t("title"), robots: { index: false } };
}

export default function SheetPage({ params }: PageProps<"/[locale]/tones/[id]/sheet">) {
  const { id } = use(params);
  return <DialInSheet generationId={id} backHref={`/tones/${id}`} />;
}

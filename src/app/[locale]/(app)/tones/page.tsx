import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LibraryView } from "@/features/library/library-view";

export async function generateMetadata({ params }: PageProps<"/[locale]/tones">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as "en" | "es", namespace: "Library" });
  // A personal history: not for search engines.
  return { title: t("title"), robots: { index: false } };
}

export default function TonesPage() {
  return <LibraryView />;
}

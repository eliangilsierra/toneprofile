import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { use } from "react";
import { LabView } from "@/features/lab/lab-view";

export const metadata: Metadata = { title: "Lab", robots: { index: false } };

// Internal design-system lab (instead of Storybook). Enabled in development or with NEXT_PUBLIC_ENABLE_LAB=1.
const enabled = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_LAB === "1";

export default function LabPage({ params }: PageProps<"/[locale]/lab">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  if (!enabled) notFound();
  return <LabView />;
}

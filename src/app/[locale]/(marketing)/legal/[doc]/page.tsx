import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { getDoc, isLegalDoc, LEGAL_DOCS } from "@/content";
import { alternatesFor } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { LongformPage } from "@/ui/longform";

// Known documents are prerendered; anything else hits notFound() below.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL_DOCS.map((doc) => ({ locale, doc })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/legal/[doc]">): Promise<Metadata> {
  const { locale, doc } = await params;
  if (!isLegalDoc(doc)) return {};
  const content = getDoc(doc, locale);
  return { title: content.title, description: content.description, alternates: alternatesFor(locale, `/legal/${doc}`) };
}

export default function LegalPage({ params }: PageProps<"/[locale]/legal/[doc]">) {
  const { locale, doc } = use(params);
  if (!isLegalDoc(doc)) notFound();
  setRequestLocale(locale as Locale);
  return <LongformPage doc={getDoc(doc, locale)} />;
}

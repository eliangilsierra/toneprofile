import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { getDoc } from "@/content";
import { alternatesFor } from "@/i18n/metadata";
import { PageTransition } from "@/motion/view-transitions";
import { LongformPage } from "@/ui/longform";

export async function generateMetadata({ params }: PageProps<"/[locale]/methodology">): Promise<Metadata> {
  const { locale } = await params;
  const doc = getDoc("methodology", locale);
  return { title: doc.title, description: doc.description, alternates: alternatesFor(locale, "/methodology") };
}

export default function MethodologyPage({ params }: PageProps<"/[locale]/methodology">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return (
    <PageTransition>
      <LongformPage doc={getDoc("methodology", locale)} />
    </PageTransition>
  );
}

import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { MarketingHeader } from "@/features/shell/marketing-header";
import { SiteFooter } from "@/features/shell/site-footer";

export default function MarketingLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = use(params);
  // Required in every layout/page for static rendering with next-intl.
  setRequestLocale(locale as Locale);
  return (
    <>
      <MarketingHeader />
      {children}
      <SiteFooter />
    </>
  );
}

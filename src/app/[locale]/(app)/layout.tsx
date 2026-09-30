import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppHeader } from "@/features/shell/app-header";
import { AppProviders } from "@/features/shell/app-providers";
import { SiteFooter } from "@/features/shell/site-footer";

// The application area is client-driven (async jobs, uploads, polling); marketing pages stay static.
export default function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return (
    <>
      <AppHeader />
      <main id="content" className="mx-auto w-full max-w-[88rem] px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <AppProviders>{children}</AppProviders>
      </main>
      <SiteFooter />
    </>
  );
}

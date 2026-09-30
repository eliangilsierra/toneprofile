import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppProviders } from "@/features/shell/app-providers";

// Examples read from the API (demo backend in mock mode), so they need the query + mock providers.
export default function ExamplesLayout({ children, params }: LayoutProps<"/[locale]/examples">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  return (
    <main id="content" className="mx-auto w-full max-w-[88rem] px-5 pb-24 pt-8 md:px-8 md:pt-12">
      <AppProviders>{children}</AppProviders>
    </main>
  );
}

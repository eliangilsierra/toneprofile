"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/ui/cn";

/**
 * `collapse`: on phones only the other locale is shown (a single tap switches), so the switcher
 * fits in the app header next to the demo marker and actions.
 */
export function LocaleSwitcher({ className, collapse = false }: { className?: string; collapse?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSearchParams();
  const t = useTranslations("Common");
  const query = Object.fromEntries(search.entries());

  return (
    <nav aria-label={t("language")} className={cn("flex items-center gap-1 font-mono text-xs uppercase", className)}>
      {routing.locales.map((candidate) => {
        const current = candidate === locale;
        return (
          <Link
            key={candidate}
            href={{ pathname, query }}
            locale={candidate}
            lang={candidate}
            hrefLang={candidate}
            aria-current={current ? "true" : undefined}
            aria-label={t(`locales.${candidate}`)}
            title={t(`locales.${candidate}`)}
            className={cn(
              "rounded-xs px-1.5 py-1 tracking-[0.08em] transition-colors",
              current ? "text-ink" : "text-ink-faint hover:text-ink",
              collapse && (current ? "max-sm:hidden" : "max-sm:text-ink-muted"),
            )}
          >
            {candidate}
          </Link>
        );
      })}
    </nav>
  );
}

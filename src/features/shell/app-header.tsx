"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { apiMode } from "@/lib/api/client";
import { NAV_FORWARD } from "@/motion/view-transitions";
import { cn } from "@/ui/cn";
import { Plus } from "@/ui/icons";
import { Logo } from "@/ui/logo";
import { LocaleSwitcher } from "./locale-switcher";
import { SignInLink } from "./sign-in-link";

function DemoBadge() {
  const t = useTranslations("Common");
  return (
    <details className="group relative">
      <summary className="label flex cursor-pointer list-none items-center gap-1.5 rounded-xs border border-warn/40 px-2 py-1 !text-warn marker:hidden [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="size-1.5 rounded-full bg-warn" />
        <span className="hidden sm:inline">{t("demoBadgeLong")}</span>
        <span className="sm:hidden">{t("demoBadge")}</span>
      </summary>
      <p className="absolute right-0 top-full z-50 mt-2 w-72 rounded-sm border border-line-strong bg-surface-2 p-4 text-sm leading-relaxed text-ink-muted shadow-2xl">
        {t("demoExplanation")}
      </p>
    </details>
  );
}

export function AppHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const links = [
    { href: "/tones", label: t("library"), active: pathname === "/tones" },
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-md" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5 md:px-8">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="/" aria-label={t("home")} className="rounded-xs">
            <Logo compact />
          </Link>
          <nav aria-label={t("primary")} className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  "rounded-xs px-1.5 py-1.5 sm:px-2.5 text-sm transition-colors",
                  link.active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {apiMode === "mock" && <DemoBadge />}
          <Suspense fallback={null}>
            <LocaleSwitcher collapse />
          </Suspense>
          <SignInLink />
          <Link
            href="/tones/new"
            transitionTypes={NAV_FORWARD}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-signal px-3 text-sm font-medium text-signal-ink transition-colors hover:bg-signal-strong"
          >
            <Plus />
            <span className="hidden sm:inline">{t("newTone")}</span>
            <span className="sr-only sm:hidden">{t("newTone")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

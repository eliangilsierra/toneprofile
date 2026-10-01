import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { NAV_FORWARD } from "@/motion/view-transitions";
import { ButtonLink } from "@/ui/button";
import { Logo } from "@/ui/logo";
import { LocaleSwitcher } from "./locale-switcher";
import { SignInLink } from "./sign-in-link";

export function MarketingHeader() {
  const t = useTranslations("Nav");
  // Landing anchors are written as "/#…" so they also work from the other marketing pages.
  const links = [
    [{ pathname: "/", hash: "how" }, t("howItWorks")],
    ["/examples", t("examples")],
    ["/methodology", t("methodology")],
    [{ pathname: "/", hash: "limits" }, t("limits")],
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/85 backdrop-blur-md" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-5 md:px-8">
        <Link href="/" aria-label={t("home")} className="rounded-xs">
          <Logo compact />
        </Link>
        <nav aria-label={t("primary")} className="hidden items-center gap-7 text-sm text-ink-muted lg:flex">
          {links.map(([href, label]) => (
            <Link key={label} href={href} className="transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
          <SignInLink />
          <ButtonLink href="/tones/new" transitionTypes={NAV_FORWARD} size="sm">
            {t("startTone")}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

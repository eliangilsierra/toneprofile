import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/ui/logo";

const PRODUCT = [
  ["/examples", "examples"],
  ["/methodology", "methodology"],
  ["/tones/new", "newTone"],
] as const;

const LEGAL = [
  ["/legal/privacy", "privacy"],
  ["/legal/terms", "terms"],
  ["/legal/audio", "audio"],
] as const;

/** Site-wide footer: product and legal links, independence disclaimer. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const tc = useTranslations("Common");
  const column = (title: string, links: readonly (readonly [string, string])[]) => (
    <div>
      <h2 className="label">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(([href, key]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-ink-muted transition-colors hover:text-ink">
              {t(key as "examples")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="no-print border-t border-line">
      <nav
        aria-label={t("label")}
        className="mx-auto grid max-w-[88rem] grid-cols-2 gap-10 px-5 py-12 sm:grid-cols-[1fr_auto_auto] sm:gap-16 md:px-8"
      >
        <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-faint">{t("disclaimer")}</p>
          <p className="text-sm text-ink-faint">
            {tc("appName")} · {t("license")}
          </p>
        </div>
        {column(t("product"), PRODUCT)}
        {column(t("legal"), LEGAL)}
      </nav>
    </footer>
  );
}

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/ui/button";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <main id="content" className="bg-grid grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="label">404</p>
        <h1 className="mt-3 font-serif text-headline">{t("title")}</h1>
        <p className="mt-4 text-ink-muted">{t("body")}</p>
        <ButtonLink href="/" variant="secondary" className="mt-8">
          {t("home")}
        </ButtonLink>
      </div>
    </main>
  );
}

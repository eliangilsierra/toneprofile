import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { PageTransition } from "@/motion/view-transitions";
import { ButtonLink } from "@/ui/button";
import { ArrowRight } from "@/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Nav" });
  return { title: t("signIn"), robots: { index: false } };
}

// Auth arrives with the backend (P6). Until then the product is honest about guest mode.
export default function SignInPage({ params }: PageProps<"/[locale]/sign-in">) {
  const { locale } = use(params);
  setRequestLocale(locale as Locale);
  const t = useTranslations("SignIn");
  return (
    <PageTransition>
      <main id="content" className="bg-grid grid place-items-center px-5 py-20 md:py-28">
        <div className="max-w-md rounded-md border border-line bg-surface-1 p-8">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-3 text-ink-muted">{t("body")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/tones/new">
              {t("continue")}
              <ArrowRight />
            </ButtonLink>
            <Link href="/legal/privacy" className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

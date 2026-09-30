import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { User } from "@/ui/icons";

/** Header entry to the account page: icon on phones, text from `sm` up. */
export function SignInLink() {
  const t = useTranslations("Nav");
  return (
    <Link
      href="/sign-in"
      className="inline-flex size-8 items-center justify-center rounded-sm text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink sm:size-auto sm:h-8 sm:px-2.5"
    >
      <User className="text-base sm:hidden" />
      <span className="max-sm:sr-only whitespace-nowrap">{t("signIn")}</span>
    </Link>
  );
}

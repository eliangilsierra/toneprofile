import type { Metadata } from "next";
import { routing } from "./routing";

/**
 * Canonical URL and hreflang alternates for a locale-prefixed page. `path` is "" for the landing
 * or starts with "/". `x-default` points to the default locale.
 */
export function alternatesFor(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((candidate) => [candidate, `/${candidate}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

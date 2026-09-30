import type { Locale } from "@/lib/api/types";
import audioEn from "./legal/audio/en";
import audioEs from "./legal/audio/es";
import privacyEn from "./legal/privacy/en";
import privacyEs from "./legal/privacy/es";
import termsEn from "./legal/terms/en";
import termsEs from "./legal/terms/es";
import methodologyEn from "./methodology/en";
import methodologyEs from "./methodology/es";
import type { LongformDoc } from "./types";

export const LEGAL_DOCS = ["privacy", "terms", "audio"] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];
export type DocKey = "methodology" | LegalDoc;

export const DOCS: Record<DocKey, Record<Locale, LongformDoc>> = {
  methodology: { en: methodologyEn, es: methodologyEs },
  privacy: { en: privacyEn, es: privacyEs },
  terms: { en: termsEn, es: termsEs },
  audio: { en: audioEn, es: audioEs },
};

export function isLegalDoc(value: string): value is LegalDoc {
  return (LEGAL_DOCS as readonly string[]).includes(value);
}

export function getDoc(key: DocKey, locale: string): LongformDoc {
  return DOCS[key][locale === "es" ? "es" : "en"];
}

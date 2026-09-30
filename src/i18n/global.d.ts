import type { routing } from "./routing";
import type messages from "../../messages/en.json";

// Type-safe locales and message keys across the app (en.json is the reference catalogue).
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}

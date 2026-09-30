import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale negotiation (Accept-Language + cookie) and redirects to /en or /es.
export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals and any path with a file extension (assets, mockServiceWorker.js).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

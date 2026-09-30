import Link from "next/link";
import { instrumentSans } from "./fonts";

// Requests outside any locale (rare: the proxy redirects almost everything to /en or /es).
export default function GlobalNotFound() {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body className="grid min-h-dvh place-items-center p-6">
        <main className="text-center">
          <p className="label">404</p>
          <h1 className="mt-2 text-2xl font-semibold">Nothing on this channel</h1>
          <Link href="/" className="mt-6 inline-block text-signal underline underline-offset-4">
            ToneProfile
          </Link>
        </main>
      </body>
    </html>
  );
}

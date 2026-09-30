import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// "mock": the browser talks to an in-page MSW backend (demo / frontend development).
// "http": /api/v1/* is proxied to the real backend (TONEPROFILE_API_URL).
const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";
const backendUrl = process.env.TONEPROFILE_API_URL;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    if (apiMode !== "http" || !backendUrl) return [];
    return [{ source: "/api/v1/:path*", destination: `${backendUrl}/v1/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);

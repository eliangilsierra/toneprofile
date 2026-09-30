// Measures JavaScript per route against a running production server
// (`npm run build && npm run start`). Usage: node scripts/measure-bundles.mjs [baseUrl]
//
// - initial_js_kb: compressed size of the <script src> tags in the HTML (what blocks interactivity)
// - total_js_kb: every script fetched until network idle (adds lazy chunks such as Motion features
//   and link prefetches for likely next routes)
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const routes = [
  "/en",
  "/es",
  "/en/tones",
  "/en/tones/new",
  "/en/examples",
  "/en/examples/northern-lights",
  "/en/methodology",
  "/en/legal/privacy",
  "/en/lab",
];

const browser = await chromium.launch();
const rows = [];
for (const route of routes) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const sizes = new Map();
  page.on("requestfinished", async (request) => {
    if (request.resourceType() !== "script") return;
    const measured = await request.sizes().catch(() => null);
    if (measured) sizes.set(new URL(request.url()).pathname, measured.responseBodySize);
  });
  const response = await page.goto(base + route, { waitUntil: "networkidle" });
  if (response?.status() === 404) {
    await context.close();
    continue;
  }
  // Scripts referenced by the server HTML (not ones injected later, e.g. link prefetches).
  const html = (await response?.text()) ?? "";
  const initial = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*>/g)]
    .filter(([tag]) => !tag.includes("noModule") && !tag.includes("nomodule"))
    .map(([, src]) => new URL(src.replaceAll("&amp;", "&"), base).pathname);
  const lcp = await page.evaluate(
    () =>
      new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(Math.round(entries[entries.length - 1].startTime));
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(null), 3000);
      }),
  );
  const kb = (bytes) => +(bytes / 1024).toFixed(1);
  const initialBytes = initial.reduce((sum, path) => sum + (sizes.get(path) ?? 0), 0);
  const totalBytes = [...sizes.values()].reduce((sum, value) => sum + value, 0);
  rows.push({ route, initial_js_kb: kb(initialBytes), total_js_kb: kb(totalBytes), lcp_ms_local: lcp });
  await context.close();
}
await browser.close();
console.table(rows);

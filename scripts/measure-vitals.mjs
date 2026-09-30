// Lighthouse-like lab vitals with Playwright + CDP (for environments where Lighthouse can't launch
// Chrome). Mobile viewport, 4× CPU slowdown, "slow 4G" network. Usage:
//   node scripts/measure-vitals.mjs [baseUrl] [route...]
import { chromium, devices } from "@playwright/test";

const [base = "http://localhost:3000", ...rest] = process.argv.slice(2);
const routes = rest.length ? rest : ["/en", "/es/tones/new"];

const browser = await chromium.launch();
const rows = [];
for (const route of routes) {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await page.addInitScript(() => {
    window.__vitals = { lcp: 0, cls: 0, longTasks: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__vitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__vitals.longTasks += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(4000);
  const vitals = await page.evaluate(() => {
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    return { ...window.__vitals, fcp: paint ? paint.startTime : null };
  });
  rows.push({
    route,
    fcp_ms: Math.round(vitals.fcp ?? 0),
    lcp_ms: Math.round(vitals.lcp),
    tbt_approx_ms: Math.round(vitals.longTasks),
    cls: +vitals.cls.toFixed(3),
  });
  await context.close();
}
await browser.close();
console.table(rows);

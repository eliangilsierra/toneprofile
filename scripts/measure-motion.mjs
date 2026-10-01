// Animation smoothness under load: frame intervals and long tasks while the product animates.
// Runs against a production server in mock mode, desktop viewport, 4× CPU slowdown. Usage:
//   node scripts/measure-motion.mjs [baseUrl]
//
// Scenarios: landing hero run, a live analysis until the result arrives, and the universal ⇄
// device translation on an example. Reports average fps, p95 frame time, frames over 50 ms and the
// total blocking time of long tasks during each window.
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";

const PROBE = () => {
  const state = { frames: [], longTasks: [], running: false };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (state.running) state.longTasks.push(entry.duration);
  }).observe({ type: "longtask", buffered: false });
  const tick = (time) => {
    if (state.running) state.frames.push(time);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.__motionProbe = state;
};

async function record(page, run) {
  await page.evaluate(() => {
    window.__motionProbe.frames = [];
    window.__motionProbe.longTasks = [];
    window.__motionProbe.running = true;
  });
  await run();
  const { frames, longTasks } = await page.evaluate(() => {
    window.__motionProbe.running = false;
    return { frames: window.__motionProbe.frames, longTasks: window.__motionProbe.longTasks };
  });
  const intervals = frames.slice(1).map((time, index) => time - frames[index]).sort((a, b) => a - b);
  const seconds = (frames.at(-1) - frames[0]) / 1000 || 1;
  const p95 = intervals[Math.floor(intervals.length * 0.95)] ?? 0;
  return {
    fps_avg: +(intervals.length / seconds).toFixed(1),
    frame_p95_ms: +p95.toFixed(1),
    frames_over_50ms: intervals.filter((value) => value > 50).length,
    tbt_ms: Math.round(longTasks.reduce((sum, value) => sum + Math.max(0, value - 50), 0)),
    window_s: +seconds.toFixed(1),
  };
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript(PROBE);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const rows = [];

await page.goto(`${base}/en`, { waitUntil: "networkidle" });
rows.push({ scenario: "landing hero run", ...(await record(page, () => page.waitForTimeout(8000))) });

await page.goto(`${base}/en/tones/new`, { waitUntil: "networkidle" });
await page.locator("input#song").fill("northern");
await page.getByRole("option", { name: /Northern Lights/ }).click();
await page.getByRole("button", { name: /Analyze tone/ }).click();
await page.waitForURL(/\/en\/tones\/gen_/);
rows.push({
  scenario: "live analysis → result",
  ...(await record(page, async () => {
    await page.getByRole("heading", { name: "Tone profile", exact: true }).waitFor({ timeout: 90_000 });
    await page.waitForTimeout(4000);
  })),
});

await page.goto(`${base}/en/examples/northern-lights`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Tone profile", exact: true }).waitFor();
await page.waitForTimeout(3000);
rows.push({
  scenario: "translation toggle ×4",
  ...(await record(page, async () => {
    const group = page.getByRole("group", { name: "View" }).first();
    for (let index = 0; index < 4; index++) {
      await group.getByText(index % 2 === 0 ? "Tone profile" : "Device", { exact: true }).click();
      await page.waitForTimeout(1200);
    }
  })),
});

await browser.close();
console.table(rows);

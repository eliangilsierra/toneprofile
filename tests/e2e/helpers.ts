import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** A short mono 16-bit PCM WAV (sine + harmonics) that browsers can decode for the waveform. */
export function makeWav(seconds: number, sampleRate = 8000): Buffer {
  const samples = Math.round(seconds * sampleRate);
  const data = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index++) {
    const t = index / sampleRate;
    const envelope = 0.4 + 0.6 * Math.abs(Math.sin(t * 2));
    const value = envelope * (0.5 * Math.sin(2 * Math.PI * 196 * t) + 0.2 * Math.sin(2 * Math.PI * 392 * t));
    data.writeInt16LE(Math.round(value * 0x5fff), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/** Picks a song from the demo catalogue through the combobox. */
export async function chooseSong(page: Page, query: string, title: RegExp) {
  const combobox = page.locator("input#song");
  await combobox.fill(query);
  await page.getByRole("option", { name: title }).click();
}

export async function attachExcerpt(page: Page, name: string, seconds = 40) {
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType: "audio/wav", buffer: makeWav(seconds) });
}

/**
 * WCAG 2.1 A/AA audit with axe-core; fails on any violation. Waits for finite animations (fades,
 * reveals) to settle first so contrast is measured on what the user actually reads.
 */
export async function expectAccessible(page: Page) {
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        // Scroll-driven animations (other timelines) and infinite loops never "finish": skip them.
        .filter((animation) => animation.timeline === document.timeline && animation.effect?.getTiming().iterations !== Infinity)
        .every((animation) => animation.playState !== "running"),
    undefined,
    { timeout: 5_000 },
  );
  await page.waitForTimeout(250);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const summary = results.violations.map((violation) => `${violation.id}: ${violation.nodes.length} node(s) — ${violation.help}`);
  expect(summary).toEqual([]);
}

/** Generations take ~15–25 s in the demo backend. */
export const ANALYSIS_TIMEOUT = 60_000;

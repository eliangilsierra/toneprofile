import { expect, test } from "@playwright/test";
import { ANALYSIS_TIMEOUT, attachExcerpt, chooseSong } from "./helpers";

test.describe("errors are product states", () => {
  test("a transient engine failure can be retried from the last step", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/en/tones/new");
    await chooseSong(page, "tape", /Tape Hiss/);
    await page.getByRole("button", { name: "Analyze tone" }).click();

    const retry = page.getByRole("button", { name: "Retry from last step" });
    await expect(page.getByRole("heading", { name: "Our tone engine is temporarily unavailable" })).toBeVisible({
      timeout: ANALYSIS_TIMEOUT,
    });
    await retry.click();
    await expect(page.getByText("Your tone is ready").first()).toBeVisible({ timeout: ANALYSIS_TIMEOUT });
  });

  test("no research and no excerpt: refuses to invent a tone and suggests adding audio", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en/tones/new");
    await chooseSong(page, "porch", /Porch Light/);
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await expect(page.getByRole("heading", { name: "Research unavailable" })).toBeVisible({ timeout: ANALYSIS_TIMEOUT });
    await expect(page.getByRole("link", { name: "Add an excerpt" })).toBeVisible();
  });

  test("no guitar detected is not retryable and asks for another passage", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en/tones/new");
    await attachExcerpt(page, "take-noguitar.wav");
    await page.getByLabel("I own this recording or have the right to use it for analysis.").check();
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await expect(page.getByRole("heading", { name: "No guitar found in this excerpt" })).toBeVisible({
      timeout: ANALYSIS_TIMEOUT,
    });
    await expect(page.getByRole("button", { name: "Retry from last step" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Choose another passage" })).toBeVisible();
  });

  test("validates the form before uploading @smoke", async ({ page }) => {
    await page.goto("/en/tones/new");
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await expect(page.getByText("Choose a song or upload an excerpt to continue.")).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
    await expect(page.getByText("This file type isn't supported. Use WAV, FLAC, MP3, M4A or OGG.")).toBeVisible();

    await attachExcerpt(page, "short.wav", 3);
    await expect(page.getByText("The audio is shorter than 5 seconds.")).toBeVisible();

    await attachExcerpt(page, "ok.wav", 20);
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await expect(page.getByText("Please confirm you have the right to use this recording.")).toBeVisible();
  });

  test("an analysis can be cancelled", async ({ page }) => {
    await page.goto("/en/tones/new");
    await chooseSong(page, "northern", /Northern Lights/);
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await page.getByRole("button", { name: "Cancel analysis" }).click();
    await expect(page.getByRole("heading", { name: "Analysis cancelled" })).toBeVisible();
  });

  test("unknown pages show the localized 404", async ({ page }) => {
    await page.goto("/es/esto-no-existe");
    await expect(page.getByRole("heading", { name: "Nada en este canal" })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";
import { attachExcerpt, chooseSong, expectAccessible } from "./helpers";

/*
 * Motion must never gate content or input, and must respect prefers-reduced-motion. These specs
 * run in the desktop project and (tagged @motion) in the reduced-motion project.
 */
test.describe("motion system", () => {
  test("the hero run ends with its outcome, and reduced motion shows it at once @motion", async ({ page }, info) => {
    await page.goto("/en");
    const reduced = info.project.name === "reduced-motion";
    // Reduced motion: the illustrated run is shown complete immediately; otherwise it plays (~8 s).
    await expect(page.getByText("Tone profile ready · GP-180 preset built")).toBeVisible({ timeout: reduced ? 3_000 : 15_000 });
    await expect(page.getByRole("img", { name: /Tone signature of the illustrated tone/ })).toBeVisible();
    if (reduced) await expect(page.getByRole("button", { name: "Replay the illustration" })).toHaveCount(0);
  });

  test("the tone signature, targets and chain highlight together; content is readable as text @motion", async ({ page }) => {
    await page.goto("/en/examples/northern-lights");
    await expect(page.getByRole("heading", { name: "Tone signature" })).toBeVisible();
    await expect(page.getByRole("img", { name: /^Tone signature: Saturation \d+%/ })).toBeVisible();

    const ambience = page.getByRole("button", { name: "Ambience" });
    await ambience.click();
    await expect(ambience).toHaveAttribute("aria-pressed", "true");
    // Keyboard: the same control toggles off.
    await ambience.press("Enter");
    await expect(ambience).toHaveAttribute("aria-pressed", "false");
    await expectAccessible(page);
  });

  test("the selected excerpt carries over to the analysis page and is measured there", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/en/tones/new");
    await chooseSong(page, "northern", /Northern Lights/);
    await attachExcerpt(page, "take.wav");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Analyze tone/ }).click();
    await expect(page).toHaveURL(/\/en\/tones\/gen_/);
    await expect(page.getByText("Your excerpt")).toBeVisible();
    await expect(page.getByText("Measured", { exact: true })).toBeVisible({ timeout: 30_000 });
  });

  test("the excerpt can be previewed before analysing", async ({ page }) => {
    await page.goto("/en/tones/new");
    await attachExcerpt(page, "take.wav");
    await page.getByRole("button", { name: "Listen to selection" }).click();
    await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
    await page.getByRole("button", { name: "Stop" }).click();
    await expect(page.getByRole("button", { name: "Listen to selection" })).toBeVisible();
  });
});

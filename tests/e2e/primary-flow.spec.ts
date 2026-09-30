import { expect, test } from "@playwright/test";
import { ANALYSIS_TIMEOUT, attachExcerpt, chooseSong, expectAccessible } from "./helpers";

test.describe("primary journey", () => {
  test("landing explains the product and is accessible @smoke", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1, name: "From song to tone." })).toBeVisible();
    await expect(page.getByRole("list", { name: "Analysis pipeline" })).toBeVisible();
    await expectAccessible(page);

    // Account entry is reachable from the header at every size (icon-only on phones).
    await page.getByRole("banner").getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/en\/sign-in$/);
    await expect(page.getByRole("link", { name: "Continue as guest" })).toBeVisible();
  });

  test("language can be switched inside the app at every size @smoke", async ({ page }) => {
    await page.goto("/es/tones");
    await expect(page.getByRole("heading", { level: 1, name: "Biblioteca" })).toBeVisible();
    await page.getByRole("banner").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/tones$/);
    await expect(page.getByRole("heading", { level: 1, name: "Library" })).toBeVisible();
  });

  test("song + excerpt → live analysis → tone profile → preset → dial-in sheet → feedback", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/en/tones/new");
    await chooseSong(page, "northern", /Northern Lights/);
    await attachExcerpt(page, "northern-intro.wav");
    await page.getByLabel("I own this recording or have the right to use it for analysis.").check();
    await expectAccessible(page);
    await page.getByRole("button", { name: "Analyze tone" }).click();

    await expect(page).toHaveURL(/\/en\/tones\/gen_/);
    const rail = page.getByRole("list", { name: "Analysis pipeline" });
    await expect(rail).toBeVisible();
    await expect(page.getByText(/Elapsed \d+:\d{2}/)).toBeVisible();

    await expect(page.getByText("Your tone is ready").first()).toBeVisible({ timeout: ANALYSIS_TIMEOUT });
    await expect(page.getByRole("heading", { name: "Tone fingerprint" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Spectrum chart/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
    await expect(page.getByText("Dark Twin").first()).toBeVisible();
    // Demo mode is honest about the file.
    await expect(page.getByRole("button", { name: "Download preset" })).toBeDisabled();
    await expectAccessible(page);

    await page.getByRole("link", { name: "Open dial-in sheet" }).click();
    await expect(page.getByRole("heading", { name: "NorthernLts" })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "DLY" })).toBeVisible();
    await expect(page.getByText("375 ms")).toBeVisible();
    await page.getByRole("link", { name: "Back to result" }).click();

    // Rate the preset: "4 · Close".
    await page.getByText("Close", { exact: true }).click();
    await page.getByRole("button", { name: "Send feedback" }).click();
    await expect(page.getByText("Thanks — noted for version 1.")).toBeVisible();
  });

  test("works end to end in Spanish @smoke", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/es/tones/new");
    await expect(page.getByRole("heading", { level: 1, name: "Nuevo tono" })).toBeVisible();
    await chooseSong(page, "iron", /Iron Parade/);
    await page.getByRole("button", { name: "Analizar tono" }).click();
    await expect(page.getByText("Tu tono está listo").first()).toBeVisible({ timeout: ANALYSIS_TIMEOUT });
    await expect(page.getByRole("heading", { name: "Evidencia" })).toBeVisible();
    await expect(page.getByText("Desconocido").first()).toBeVisible();
  });

  test("library lists generated tones", async ({ page }) => {
    await page.goto("/en/tones");
    await expect(page.getByRole("heading", { name: "No tones yet" })).toBeVisible();
    await page.goto("/en/tones/new");
    await chooseSong(page, "iron", /Iron Parade/);
    await page.getByRole("button", { name: "Analyze tone" }).click();
    await expect(page).toHaveURL(/\/tones\/gen_/);
    await page.getByRole("link", { name: "Back to library" }).click();
    await expect(page.getByRole("link", { name: /Iron Parade/ })).toBeVisible();
  });
});

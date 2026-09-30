import { expect, test } from "@playwright/test";
import { expectAccessible } from "./helpers";

test.describe("examples", () => {
  test("landing → examples → a complete example → its dial-in sheet @smoke", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Browse examples" }).click();
    await expect(page).toHaveURL(/\/en\/examples$/);
    const list = page.getByRole("list", { name: "Examples" });
    await expect(list.getByRole("link")).toHaveCount(3);
    await expectAccessible(page);

    await list.getByRole("link", { name: /Northern Lights/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Northern Lights/ })).toBeVisible();
    await expect(page.getByText("Illustrative example with a fictional song", { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tone profile", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Preset/ })).toBeVisible();
    // Feedback is for the user's own presets only.
    await expect(page.getByRole("heading", { name: "How close did it get?" })).toHaveCount(0);
    await expectAccessible(page);

    await page.getByRole("link", { name: "Open dial-in sheet" }).click();
    await expect(page).toHaveURL(/\/en\/examples\/northern-lights\/sheet$/);
    await expect(page.getByRole("table")).toBeVisible();
    await page.getByRole("link", { name: "Back to result" }).click();
    await expect(page).toHaveURL(/\/en\/examples\/northern-lights$/);
  });

  test("a degraded example says so, in Spanish", async ({ page }) => {
    await page.goto("/es/examples/porch-light");
    await expect(page.getByRole("heading", { level: 1, name: /Porch Light/ })).toBeVisible();
    await expect(page.getByText("Conviene saber")).toBeVisible();
    await expect(page.getByText(/No pudimos investigar el equipo de esta canción/).first()).toBeVisible();
  });

  test("an unknown example is a product state, not a crash", async ({ page }) => {
    await page.goto("/en/examples/does-not-exist");
    await expect(page.getByRole("link", { name: "All examples" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Not found" })).toBeVisible();
  });
});

test.describe("methodology and legal", () => {
  test("methodology explains evidence levels and its table of contents works", async ({ page }) => {
    await page.goto("/en/methodology");
    await expect(page.getByRole("heading", { level: 1, name: "How ToneProfile works" })).toBeVisible();
    await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Evidence levels" }).click();
    await expect(page).toHaveURL(/#evidence$/);
    await expect(page.getByRole("heading", { level: 2, name: "Evidence levels" })).toBeInViewport();
    await expectAccessible(page);
  });

  for (const [path, title] of [
    ["/en/legal/privacy", "Privacy policy"],
    ["/en/legal/terms", "Terms of use"],
    ["/en/legal/audio", "Audio & copyright policy"],
    ["/es/legal/privacy", "Política de privacidad"],
    ["/es/legal/terms", "Términos de uso"],
    ["/es/legal/audio", "Política de audio y derechos"],
  ] as const) {
    test(`${path} renders as a draft pending legal review`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("note")).toContainText(/legal review|revisión legal/);
      if (path === "/en/legal/privacy") await expectAccessible(page);
    });
  }

  test("unknown legal documents are 404s", async ({ page }) => {
    const response = await page.goto("/en/legal/cookies");
    expect(response?.status()).toBe(404);
  });

  test("footer reaches every secondary page from any page @smoke", async ({ page }) => {
    await page.goto("/es/tones");
    const footer = page.getByRole("navigation", { name: "Sitio" });
    for (const name of ["Ejemplos", "Metodología", "Privacidad", "Términos de uso", "Audio y derechos"]) {
      await expect(footer.getByRole("link", { name })).toBeVisible();
    }
    await footer.getByRole("link", { name: "Audio y derechos" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Política de audio y derechos" })).toBeVisible();
  });
});

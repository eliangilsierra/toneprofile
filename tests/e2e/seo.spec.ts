import { expect, test, type Page } from "@playwright/test";

async function head(page: Page) {
  return page.evaluate(() => ({
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    hreflang: Object.fromEntries(
      [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((link) => [
        link.getAttribute("hreflang"),
        new URL(link.getAttribute("href")!, location.origin).pathname,
      ]),
    ),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
  }));
}

// Indexable pages point to themselves (never to the home page) and list both languages.
const INDEXABLE = ["", "/tones/new", "/examples", "/examples/northern-lights", "/methodology", "/legal/privacy"];
// Personal or utility pages are noindex and carry no canonical.
const NOINDEX = ["/tones", "/sign-in", "/examples/northern-lights/sheet"];

test.describe("canonical URLs", () => {
  for (const path of INDEXABLE) {
    test(`/es${path} is canonical to itself with hreflang alternates`, async ({ page }) => {
      await page.goto(`/es${path}`);
      const meta = await head(page);
      expect(new URL(meta.canonical!, "http://x").pathname).toBe(`/es${path}`);
      expect(meta.hreflang).toEqual({ en: `/en${path}`, es: `/es${path}`, "x-default": `/en${path}` });
      expect(meta.robots).toBeNull();
    });
  }

  for (const path of NOINDEX) {
    test(`/en${path} is noindex without a canonical`, async ({ page }) => {
      await page.goto(`/en${path}`);
      const meta = await head(page);
      expect(meta.canonical).toBeNull();
      expect(meta.robots).toContain("noindex");
    });
  }
});

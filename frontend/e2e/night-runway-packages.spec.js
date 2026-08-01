const { test, expect } = require("@playwright/test");

const responsiveViewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 430, height: 932 },
  { width: 568, height: 320 },
];

test.describe("Night Runway package stage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pachete", { waitUntil: "domcontentloaded" });
  });

  test("uses one comparator stage instead of the old hero and comparison table", async ({ page }) => {
    await expect(page.locator("main[data-design='night-runway']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Pachete" })).toBeVisible();
    await expect(page.getByTestId("package-comparator")).toBeVisible();
    await expect(page.getByTestId("package-stage")).toBeVisible();
    await expect(page.getByTestId("package-transition-band")).toHaveCount(5);

    await expect(page.getByTestId("packages-hero")).toHaveCount(0);
    await expect(page.getByTestId("packages-flight-plan")).toHaveCount(0);
    await expect(page.getByTestId("packages-comparison")).toHaveCount(0);
    await expect(page.locator(".package-editorial-grid, .package-editorial-card")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/plan de zbor|flight|telemetrie/i);
  });

  test("uses the matching YouTube thumbnail before a package video is opened", async ({ page }) => {
    const media = page.locator(".nr-package-stage__media img");
    const categories = page.getByRole("tablist", { name: "Categorii de spectacol" }).getByRole("tab");
    await expect(categories).not.toHaveCount(0);
    let inspectedPackages = 0;

    for (let categoryIndex = 0; categoryIndex < await categories.count(); categoryIndex += 1) {
      await categories.nth(categoryIndex).click();

      const variants = page.getByRole("tablist", { name: /Variante pentru/ }).getByRole("tab");
      for (let variantIndex = 0; variantIndex < await variants.count(); variantIndex += 1) {
        await variants.nth(variantIndex).click();
        await expect(media).toHaveAttribute("src", /https:\/\/i\.ytimg\.com\/vi\/.+\/hqdefault\.jpg/);
        inspectedPackages += 1;
      }
    }

    expect(inspectedPackages).toBe(8);
  });

  test("compares categories and variants with keyboard-safe controls", async ({ page }) => {
    const categories = page.getByRole("tablist", { name: "Categorii de spectacol" });
    await expect(categories.getByRole("tab")).toHaveCount(6);
    await expect(categories.getByRole("tab", { name: "Drone + artificii" })).toHaveAttribute("aria-selected", "true");

    const variants = page.getByRole("tablist", { name: "Variante pentru Drone + artificii" });
    await expect(variants.getByRole("tab")).toHaveCount(2);
    await expect(page.getByTestId("packages-active-title")).toHaveText("Hybrid Signature");

    const firstVariant = variants.getByRole("tab", { name: /Hybrid Signature/ });
    await firstVariant.focus();
    await page.keyboard.press("ArrowRight");
    await expect(variants.getByRole("tab", { name: /Hybrid Grand/ })).toBeFocused();
    await expect(page.getByTestId("packages-active-title")).toHaveText("Hybrid Grand");

    await categories.getByRole("tab", { name: "Show drone" }).click();
    await expect(page.getByRole("tablist", { name: "Variante pentru Show drone" }).getByRole("tab")).toHaveCount(3);
    await expect(page.getByTestId("packages-active-title")).toHaveText("Drone Story 60");
  });

  test("runs a local five-band transition when the active variant changes", async ({ page }) => {
    const stage = page.getByTestId("package-stage");
    const grand = page.getByRole("tab", { name: /Hybrid Grand/ });

    await grand.click();
    await expect(stage).toHaveAttribute("data-transition-state", "cover");
    await expect(page.getByTestId("packages-active-title")).toHaveText("Hybrid Grand");
    await expect(stage).toHaveAttribute("data-transition-state", "idle");
  });

  test("switches instantly when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });

    await page.getByRole("tab", { name: /Hybrid Grand/ }).click();
    await expect(page.getByTestId("packages-active-title")).toHaveText("Hybrid Grand");
    await expect(page.getByTestId("package-stage")).toHaveAttribute("data-transition-state", "idle");
  });

  test("keeps the selected package contract when opening contact", async ({ page }) => {
    await page.getByRole("tab", { name: /Hybrid Grand/ }).click();
    await expect(page.getByTestId("packages-active-title")).toHaveText("Hybrid Grand");

    await page.route("**/contact", (route) => route.abort());
    const request = page.waitForRequest((candidate) => new URL(candidate.url()).pathname === "/contact");
    await page.getByTestId("packages-direct-cta").click();
    await request;

    const selection = await page.evaluate(() => (
      JSON.parse(window.sessionStorage.getItem("fireartro-contact-prefill") || "{}")
    ));
    expect(selection).toEqual({
      package_id: "hybrid-grand",
      package_title: "Hybrid Grand",
      services: ["Drone + artificii"],
    });
  });

  for (const viewport of responsiveViewports) {
    test(`stays compact and usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.reload({ waitUntil: "domcontentloaded" });

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(dimensions.viewport + 1);

      const categoryTab = page.getByRole("tablist", { name: "Categorii de spectacol" }).getByRole("tab").first();
      const variantTab = page.getByRole("tablist", { name: "Variante pentru Drone + artificii" }).getByRole("tab").first();
      const directCta = page.getByTestId("packages-direct-cta");

      for (const control of [categoryTab, variantTab, directCta]) {
        const box = await control.boundingBox();
        expect(box?.height, `${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(44);
      }

      await expect(page.getByTestId("package-stage")).toBeVisible();
      await expect(directCta).toBeVisible();
    });
  }
});

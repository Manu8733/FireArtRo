const { test, expect } = require("@playwright/test");

const viewportMatrix = [
  { name: "compact Android", width: 360, height: 800, mobile: true },
  { name: "iPhone portrait", width: 390, height: 844, mobile: true },
  { name: "large phone", width: 430, height: 932, mobile: true },
  { name: "phone landscape", width: 844, height: 390, mobile: true },
  { name: "tablet portrait", width: 768, height: 1024, mobile: true },
  { name: "tablet landscape", width: 1024, height: 768, mobile: false },
  { name: "laptop", width: 1366, height: 768, mobile: false },
  { name: "wide desktop", width: 1920, height: 1080, mobile: false },
];

test.describe("FireArt home responsive matrix", () => {
  test("keeps critical home content inside the viewport at common device sizes", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    for (const viewport of viewportMatrix) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(120);

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(dimensions.page, `${viewport.name} should not create horizontal page overflow`)
        .toBeLessThanOrEqual(dimensions.viewport + 1);

      const hero = page.getByTestId("hero-section");
      const primaryCta = page.getByTestId("hero-primary-cta");
      const secondaryCta = page.getByTestId("hero-secondary-cta");
      await expect(hero, `${viewport.name} hero`).toBeVisible();
      await expect(primaryCta, `${viewport.name} primary CTA`).toBeVisible();
      await expect(secondaryCta, `${viewport.name} secondary CTA`).toBeVisible();

      for (const locator of [primaryCta, secondaryCta]) {
        const box = await locator.boundingBox();
        expect(box?.x, `${viewport.name} CTA starts inside viewport`).toBeGreaterThanOrEqual(-1);
        expect((box?.x || 0) + (box?.width || 0), `${viewport.name} CTA ends inside viewport`)
          .toBeLessThanOrEqual(viewport.width + 1);
      }

      const sections = [
        ["showcase", page.getByTestId("home-showcase")],
        ["team", page.getByTestId("home-team")],
        ["partners", page.getByTestId("home-partners")],
        ["brief", page.getByTestId("home-brief")],
      ];

      for (const [name, section] of sections) {
        await section.evaluate((element) => element.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(80);
        await expect(section, `${viewport.name} section`).toBeVisible();
      }

      const mobileMenu = page.getByTestId("mobile-menu-trigger");
      const desktopLinks = page.locator(".site-navbar-links > a");
      const isMobileNavigation = await mobileMenu.isVisible();
      const isDesktopNavigation = await desktopLinks.first().isVisible();
      expect(isMobileNavigation || isDesktopNavigation, `${viewport.name} navigation is available`)
        .toBeTruthy();

      if (isMobileNavigation) {
        const menuBox = await mobileMenu.boundingBox();
        expect(Math.min(menuBox?.width || 0, menuBox?.height || 0), `${viewport.name} menu touch target`)
          .toBeGreaterThanOrEqual(44);
      } else {
        expect(isDesktopNavigation, `${viewport.name} desktop navigation`).toBeTruthy();
      }
    }
  });
});

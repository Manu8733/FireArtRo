const { test, expect, devices } = require("@playwright/test");

const iphone14 = devices["iPhone 14"];

test.use({
  userAgent: iphone14.userAgent,
  viewport: iphone14.viewport,
  deviceScaleFactor: iphone14.deviceScaleFactor,
  isMobile: iphone14.isMobile,
  hasTouch: iphone14.hasTouch,
});

const scrollPage = async (page, amount) => {
  await page.evaluate((delta) => window.scrollBy(0, delta), amount);
  await page.waitForTimeout(300);
};

test.describe("FireArt touch motion", () => {
  test("uses gallery scroll and package reveal motion on touch", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const gallery = page.getByTestId("home-gallery");
    const packages = page.getByTestId("home-packages");

    await expect(gallery).toHaveAttribute("data-motion", "scroll");
    await expect(packages).toHaveAttribute("data-motion", "reveal");
    await expect(packages.locator(".pin-spacer")).toHaveCount(0);

    await gallery.scrollIntoViewIfNeeded();
    await scrollPage(page, 420);
    await expect(gallery.locator(".fa-work__track")).not.toHaveCSS("transform", "none");

    await packages.scrollIntoViewIfNeeded();
    for (const panel of await packages.locator("[data-package-panel]").all()) {
      await expect(panel).toBeVisible();
    }
  });
});

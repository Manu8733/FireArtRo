const { test, expect, devices } = require("@playwright/test");

test.use({ ...devices["iPhone 14"] });

test.describe("FireArt touch motion", () => {
  test("uses the desktop GSAP timelines instead of a static fallback", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const gallery = page.getByTestId("home-gallery");
    const packages = page.getByTestId("home-packages");

    await expect(gallery).toHaveAttribute("data-motion", "scroll");
    await expect(packages).toHaveAttribute("data-motion", "scroll");
    await expect(page.locator(".pin-spacer").first()).toBeAttached();

    await gallery.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 420);
    await expect(gallery.locator(".fa-work__track")).not.toHaveCSS("transform", "none");

    await packages.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 420);
    await expect(packages.locator("[data-gallery-handoff]")).not.toHaveCSS("transform", "none");
  });
});

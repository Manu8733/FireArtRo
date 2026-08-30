const { test, expect } = require("@playwright/test");

const routeDesigns = [
  ["/", "night-runway"],
  ["/pachete", "night-runway"],
  ["/galerie", "editorial-mosaic"],
  ["/intrebari-frecvente", "night-runway"],
  ["/contact", "night-runway"],
];

for (const [route, design] of routeDesigns) {
  test(`${route} uses the Night Runway design contract`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator(`main[data-design='${design}']`)).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);

    await expect(page.locator("[data-testid='main-navbar']")).toBeVisible();
    await expect(page.locator("[data-testid='nav-logo'] img")).toBeVisible();
  });
}

test("landing preserves the existing hero media and social controls", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-testid='hero-section'] video")).toHaveCount(1);
  await expect(page.locator("[data-testid='hero-primary-cta']")).toBeVisible();
  await expect(page.locator("[data-testid='hero-primary-cta']")).toHaveCSS("min-height", /4[4-9]px|[5-9]\dpx/);
  await expect(page.locator("[data-testid='social-dock'], .social-dock").first()).toBeAttached();
});

test("keyboard users receive a visible focus treatment", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus-visible");
  await expect(focused).toBeVisible();
  const outline = await focused.evaluate((node) => getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe("none");
});

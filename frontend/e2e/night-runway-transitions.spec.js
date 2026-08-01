const { test, expect } = require("@playwright/test");

test.describe("FireArt scroll-directed motion", () => {
  test("builds the three-panel package dock without the retired service scenes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const packages = page.getByTestId("home-packages");
    await expect(packages).toHaveAttribute("data-motion", "scroll");
    await expect(packages.locator("[data-package-slab]")).toHaveCount(3);
    await expect(packages.locator("[data-package-transition-band]")).toHaveCount(0);
    await expect(packages.locator("[data-package-dock]")).toHaveCount(1);
    await expect(page.getByTestId("service-stage")).toHaveCount(0);
    await expect(page.getByTestId("section-shutter")).toHaveCount(0);
    await expect(page.getByTestId("home-process")).toHaveCount(0);
  });

  test("pulls one solid continuation sheet left to reveal packages", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packages = page.getByTestId("home-packages");
    const sticky = packages.locator(".fa-packages__sticky");
    const handoff = page.getByTestId("gallery-package-handoff");
    await expect(packages).toHaveCSS("margin-top", "-900px");
    await expect(sticky).toHaveCSS("opacity", "0");

    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((top) => window.scrollTo(0, top + 1), packageTop);
    await expect(sticky).toHaveCSS("opacity", "1");
    await expect(handoff).toHaveCount(1);
    await expect(handoff).toHaveCSS("background-color", "rgb(7, 26, 44)");
    await expect(handoff).toHaveAttribute("data-direction", "exit-left");
    await expect(handoff).toContainText("Spectacolul continuă");
    await expect(handoff.locator("[data-handoff-gallery-image]")).toHaveCount(1);
    const finalGallerySource = await page
      .getByTestId("home-gallery")
      .locator("[data-gallery-item] img")
      .last()
      .getAttribute("src");
    await expect(handoff.locator("[data-handoff-gallery-image]")).toHaveAttribute("src", finalGallerySource);
    await expect(page.getByTestId("package-reveal-copy")).toContainText(/O noapte\.\s*Trei direcții\./);
    await expect(page.getByTestId("package-reveal-copy")).toHaveAttribute("data-sequence", "before-packages");
    await expect(page.getByTestId("home-packages").locator("[data-package-youtube]")).toHaveCount(3);
  });

  test("keeps the final gallery frame moving until the horizontal handoff without a vertical jump", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packages = page.getByTestId("home-packages");
    const finalGalleryFigure = page
      .getByTestId("home-gallery")
      .locator("[data-gallery-item]")
      .last()
      .locator("figure");
    const handoffFigure = page
      .getByTestId("gallery-package-handoff")
      .locator(".fa-packages__handoff-card figure");
    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);

    const readRectAt = async (scrollY, locator) => {
      await page.evaluate((top) => window.scrollTo(0, top), scrollY);
      await page.waitForTimeout(1100);
      return locator.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
    };

    const heldFrame = await readRectAt(packageTop - 320, finalGalleryFigure);
    const lastGalleryFrame = await readRectAt(packageTop - 2, finalGalleryFigure);
    const firstHandoffFrame = await readRectAt(packageTop + 2, handoffFigure);

    expect(lastGalleryFrame.x, "the final gallery card continues travelling before handoff")
      .toBeLessThan(heldFrame.x - 24);

    for (const key of ["y", "width", "height"]) {
      expect(Math.abs(heldFrame[key] - lastGalleryFrame[key]), `${key} shifts vertically before handoff`).toBeLessThan(2);
    }

    for (const key of ["x", "y", "width", "height"]) {
      expect(Math.abs(lastGalleryFrame[key] - firstHandoffFrame[key]), `${key} jumps at handoff`).toBeLessThan(2);
    }
  });

  test("keeps the gallery continuation sheet pinned through the handoff", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packages = page.getByTestId("home-packages");
    const finalOutro = page.getByTestId("home-gallery").locator(".fa-work__outro-inner");
    const handoffImage = page
      .getByTestId("gallery-package-handoff")
      .locator("[data-handoff-gallery-image]");
    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);

    const readY = async (scrollY, locator) => {
      await page.evaluate((top) => window.scrollTo(0, top), scrollY);
      await page.waitForTimeout(1100);
      return locator.evaluate((node) => node.getBoundingClientRect().y);
    };

    const beforeHandoff = await readY(packageTop - 900, finalOutro);
    const finalGalleryFrame = await readY(packageTop - 2, finalOutro);
    const handoffStart = await readY(packageTop + 2, handoffImage);
    const handoffMidpoint = await readY(packageTop + 260, handoffImage);

    expect(Math.abs(beforeHandoff - finalGalleryFrame)).toBeLessThan(1);
    expect(Math.abs(handoffStart - handoffMidpoint)).toBeLessThan(1);
  });

  test("responds to the package handoff without a dead scroll interval", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(850);

    const packages = page.getByTestId("home-packages");
    const handoff = page.getByTestId("gallery-package-handoff");
    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);

    const translateX = async () => handoff.evaluate((node) => {
      const values = getComputedStyle(node).transform.match(/matrix\(([^)]+)\)/)?.[1].split(",");
      return values ? Number(values[4]) : 0;
    });

    await page.evaluate((top) => window.scrollTo(0, top - 420), packageTop);
    await page.waitForTimeout(1000);
    await page.evaluate((top) => window.scrollTo(0, top + 520), packageTop);
    await page.waitForTimeout(250);

    expect(await translateX()).toBeLessThan(-120);
  });

  test("uses a longer scroll runway for the gallery continuation sheet", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(850);

    const packages = page.getByTestId("home-packages");
    const handoff = page.getByTestId("gallery-package-handoff");
    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);

    await page.evaluate((top) => window.scrollTo(0, top + 900), packageTop);
    await page.waitForTimeout(700);

    const translateX = await handoff.evaluate((node) => {
      const values = getComputedStyle(node).transform.match(/matrix\(([^)]+)\)/)?.[1].split(",");
      return values ? Number(values[4]) : 0;
    });

    expect(translateX, "the continuation sheet should still be partially on screen at 900px").toBeGreaterThan(-1300);
  });

  test("uses a longer scroll range for the slower package lineup", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(850);

    const packages = page.getByTestId("home-packages");
    const firstPackage = packages.locator("[data-package-slab]").first();
    const packageTop = await packages.evaluate((node) => node.getBoundingClientRect().top + window.scrollY);

    await page.evaluate((top) => window.scrollTo(0, top + 1550), packageTop);
    await page.waitForTimeout(700);

    const opacity = await firstPackage.evaluate((node) => Number(getComputedStyle(node).opacity));
    expect(opacity, "the slower package lineup should not reach the dock too early").toBeLessThan(0.8);
  });

  test("does not hold the gallery to packages handoff for an excessive scroll distance", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const packages = page.getByTestId("home-packages");
    const { sectionHeight, viewportHeight } = await packages.evaluate((node) => ({
      sectionHeight: node.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
    }));

    expect(sectionHeight).toBeGreaterThan(viewportHeight * 5.25);
    expect(sectionHeight).toBeLessThan(viewportHeight * 5.6);
  });

  test("uses one warmed WebGL canvas only for the partner orbit", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const partners = page.getByTestId("home-partners");
    await expect(partners.locator("canvas")).toHaveCount(1);
    await expect(partners).toHaveAttribute("data-gpu", /warming|ready/);
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(partners.locator("[data-partner-name]")).toHaveCount(12);
  });

  test("renders readable static fallbacks for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("home-packages")).toHaveAttribute("data-motion", "static");
    await expect(page.getByTestId("home-partners").locator("canvas")).toHaveCount(0);
    await expect(page.getByTestId("home-partners").locator("[data-partner-name]")).toHaveCount(12);
  });

  test("keeps route transitions in a neutral cinematic black", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const overlay = page.getByTestId("route-shutter");
    const routeBands = overlay.locator("[data-route-band]");
    await expect(routeBands).toHaveCount(10);
    const bandColors = await routeBands.evaluateAll((nodes) =>
      nodes.map((node) => getComputedStyle(node).backgroundColor),
    );
    expect(bandColors).toEqual(Array(10).fill("rgb(1, 1, 2)"));
  });
});

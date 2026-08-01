const { test, expect } = require("@playwright/test");

const routesWithFooter = ["/", "/pachete", "/galerie", "/intrebari-frecvente", "/contact"];

test.describe("Night Runway final CTA and footer", () => {
  test("builds the home ending around an electric horizon and direct contact actions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const cta = page.getByTestId("night-final-cta");
    await expect(cta).toBeVisible();
    await expect(cta.getByTestId("night-final-cta-media")).toBeVisible();
    await expect(cta.getByTestId("night-final-cta-horizon")).toBeVisible();

    const primary = cta.getByRole("button", { name: "Planifică spectacolul" });
    await expect(primary).toBeVisible();
    await expect(primary).toHaveCSS("clip-path", /polygon/);
    expect((await primary.boundingBox()).height).toBeGreaterThanOrEqual(44);

    const whatsapp = cta.getByRole("link", { name: "Continuă pe WhatsApp" });
    await expect(whatsapp).toHaveAttribute("href", /^https:\/\//);
    await expect(whatsapp).toHaveAttribute("target", "_blank");

    await primary.click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("uses an oversized wordmark without losing contact, social or legal destinations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const footer = page.getByTestId("night-runway-footer");
    await expect(footer).toBeVisible();

    const wordmark = footer.getByTestId("night-footer-wordmark");
    await expect(wordmark).toContainText("FIREARTRO");
    const wordmarkSize = await wordmark.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
    expect(wordmarkSize).toBeGreaterThanOrEqual(120);

    await expect(footer.getByRole("link", { name: "Contact" }).first()).toHaveAttribute("href", "/contact");
    await expect(footer.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", /^https:\/\//);
    await expect(footer.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", /^https:\/\//);
    await expect(footer.getByRole("link", { name: "YouTube" })).toHaveAttribute("href", /^https:\/\//);
    await expect(footer.getByRole("link", { name: "Confidențialitate" })).toHaveAttribute("href", "/confidentialitate");
    await expect(footer.getByRole("link", { name: "Termeni și condiții" })).toHaveAttribute("href", "/termeni-si-conditii");
    await expect(footer.getByRole("link", { name: "Cookies" })).toHaveAttribute("href", "/cookies");
    await expect(footer.getByRole("button", { name: "Setări cookies" })).toBeVisible();
  });

  for (const route of routesWithFooter) {
    test(`${route} keeps the footer reachable and keyboard legible`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const footer = page.getByTestId("night-runway-footer");
      await expect(footer).toBeVisible();

      const contactLink = footer.getByRole("link", { name: "Contact" }).first();
      await contactLink.focus();
      const focus = await contactLink.evaluate((node) => {
        const styles = getComputedStyle(node);
        return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
      });
      expect(focus.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(focus.outlineWidth)).toBeGreaterThanOrEqual(2);
    });
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 568, height: 320 },
  ]) {
    test(`remains usable without horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);

      const footer = page.getByTestId("night-runway-footer");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.getByRole("link", { name: "Contact" }).first()).toBeVisible();

      const interactiveHeights = await footer.locator("a, button").evaluateAll((nodes) =>
        nodes.filter((node) => getComputedStyle(node).display !== "none").map((node) => node.getBoundingClientRect().height),
      );
      expect(Math.min(...interactiveHeights)).toBeGreaterThanOrEqual(44);
    });
  }

  test("removes decorative motion when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const horizon = page.getByTestId("night-final-cta-horizon");
    await expect(horizon).toHaveCSS("animation-name", "none");
    await expect(page.getByTestId("night-runway-footer")).toHaveCSS("scroll-behavior", "auto");
  });
});

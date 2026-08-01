const { test, expect } = require("@playwright/test");

const consent = {
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: "2026-08-01T00:00:00.000Z",
  expiresAt: "2027-08-01T00:00:00.000Z",
};

test.describe("FireArt visual smoke", () => {
  test("renders a clean hero and active team state", async ({ page }, testInfo) => {
    await page.addInitScript((storedConsent) => {
      window.localStorage.setItem("fireartro-cookie-consent-v1", JSON.stringify(storedConsent));
    }, consent);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("cookie-consent")).toHaveCount(0);
    await expect(page.locator("#acasa")).toBeVisible();
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath("hero.png"), fullPage: false });

    const team = page.getByTestId("home-team");
    await team.scrollIntoViewIfNeeded();
    const portrait = team.locator("[data-team-person]").first();
    await expect(portrait).toBeVisible();

    if (testInfo.project.name.startsWith("mobile-")) {
      await portrait.dispatchEvent("touchstart");
      await page.waitForTimeout(260);
    } else {
      await portrait.hover();
      await page.waitForTimeout(260);
    }

    await expect(team).toHaveAttribute("data-active-person", "production");
    await page.screenshot({ path: testInfo.outputPath("team-active.png"), fullPage: false });

    if (testInfo.project.name.startsWith("mobile-")) {
      await portrait.dispatchEvent("touchend");
      await expect(team).not.toHaveAttribute("data-active-person", /.+/);
    }
  });
});

const { test, expect, devices } = require("@playwright/test");

test.use({ ...devices["Pixel 7"] });

test.describe("FireArt team touch preview", () => {
  test("selects on tap, switches directly, and dismisses only outside the team portrait", async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.startsWith("mobile-") && testInfo.project.name !== "tablet-webkit",
      "Tap interaction is covered by touch browser projects only.",
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const team = page.getByTestId("home-team");
    const portraits = team.locator("[data-team-person]");
    const firstPortrait = portraits.first();
    const secondPortrait = portraits.nth(1);

    await expect(team).not.toHaveAttribute("data-active-person", /.+/);
    await firstPortrait.dispatchEvent("pointerdown", {
      pointerType: "touch",
      pointerId: 1,
      isPrimary: true,
    });

    await expect(team).toHaveAttribute("data-active-person", "production");
    await expect(team.locator("[data-team-copy]")).toHaveAttribute("data-visible", "true");
    await expect(team.locator("[data-team-copy]")).toHaveCSS("display", "block");
    await expect(page.locator("dialog.fa-team-dialog")).toHaveCount(0);

    await firstPortrait.dispatchEvent("pointerup", {
      pointerType: "touch",
      pointerId: 1,
      isPrimary: true,
    });
    await expect(team).toHaveAttribute("data-active-person", "production");

    await secondPortrait.dispatchEvent("pointerdown", {
      pointerType: "touch",
      pointerId: 2,
      isPrimary: true,
    });
    await expect(team).toHaveAttribute("data-active-person", "show-design");

    await page.locator(".fa-team__heading").dispatchEvent("pointerdown", {
      pointerType: "touch",
      pointerId: 3,
      isPrimary: true,
    });
    await expect(team).not.toHaveAttribute("data-active-person", /.+/);
  });
});

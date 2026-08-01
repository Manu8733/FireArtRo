const { test, expect, devices } = require("@playwright/test");

test.use({ ...devices["Pixel 7"] });

test.describe("FireArt team touch preview", () => {
  test("activates a portrait only while it is held on a touch device", async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.startsWith("mobile-") && testInfo.project.name !== "tablet-webkit",
      "Long press is covered by touch browser projects only.",
    );
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const team = page.getByTestId("home-team");
    const portrait = team.locator("[data-team-person]").first();

    await expect(team).not.toHaveAttribute("data-active-person", /.+/);
    await portrait.dispatchEvent("pointerdown", {
      pointerType: "touch",
      pointerId: 1,
      isPrimary: true,
    });
    await page.waitForTimeout(260);

    await expect(team).toHaveAttribute("data-active-person", "production");
    await expect(team.locator("[data-team-copy]")).toHaveAttribute("data-visible", "true");
    await expect(page.locator("dialog.fa-team-dialog")).toHaveCount(0);

    await portrait.dispatchEvent("pointerup", {
      pointerType: "touch",
      pointerId: 1,
      isPrimary: true,
    });
    await expect(team).not.toHaveAttribute("data-active-person", /.+/);
  });
});

const { expect, test } = require("@playwright/test");

const necessaryConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: "2026-08-31T00:00:00.000Z",
  expiresAt: "2099-08-31T00:00:00.000Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((consent) => {
    window.localStorage.setItem("fireartro-cookie-consent-v1", JSON.stringify(consent));
  }, necessaryConsent);
});

test("homepage gallery is substantial and requested sections use photographic atmosphere", async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto("/#acasa", { waitUntil: "domcontentloaded" });

  const metrics = await page.evaluate(() => {
    const background = (selector, pseudo = "::before") =>
      getComputedStyle(document.querySelector(selector), pseudo).backgroundImage;
    const card = document.querySelector(".fa-work__card-inner").getBoundingClientRect();

    return {
      cardRatio: card.width / window.innerWidth,
      gallery: background(".fa-work__sticky"),
      packages: background(".fa-packages"),
      aboutFilter: getComputedStyle(document.querySelector(".fa-about__image img")).filter,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(metrics.cardRatio).toBeGreaterThanOrEqual(0.54);
  expect(metrics.cardRatio).toBeLessThanOrEqual(0.6);
  expect(metrics.gallery).toContain("fireartro-drone-show-focsani-dji-0768-enhanced-nr");
  expect(metrics.packages).toContain("fireartro-artificii-noapte-spectacol-091");
  expect(metrics.aboutFilter).toContain("blur");
  expect(metrics.overflow).toBeLessThanOrEqual(1);

  const packages = page.getByTestId("home-packages");
  await expect(packages.getByRole("heading", { level: 2 }))
    .toHaveText("Fiecare noapte cere alt spectacol.");
  await expect(packages).not.toContainText("Alege un punct de plecare");
});

for (const [route, selector, asset] of [
  ["/contact", ".nr-contact-main", "fireartro-artificii-noapte-spectacol-070.webp"],
  ["/intrebari-frecvente", ".nr-faq-route", "fireartro-drone-show-neversea-show-img-4351.webp"],
  ["/galerie", ".nr-gallery-page", "fireartro-drone-show-untold-img-6900-2.webp"],
  ["/pachete", ".nr-packages-page", "fireartro-artificii-noapte-spectacol-091.webp"],
]) {
  test(`${route} uses its assigned atmospheric image behind content`, async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const state = await page.locator(selector).evaluate((node) => ({
      image: getComputedStyle(node, "::before").backgroundImage,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));

    expect(state.image).toContain(asset.replace(/\.webp$/, ""));
    expect(state.image).toContain(".webp");
    expect(state.overflow).toBeLessThanOrEqual(1);
  });
}

test("keeps FAQ content transparent so its atmospheric photo stays visible", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("/intrebari-frecvente", { waitUntil: "domcontentloaded" });

  const state = await page.locator("main.nr-faq-page").evaluate((node) => ({
    contentBackground: getComputedStyle(node).backgroundColor,
    atmosphere: getComputedStyle(node.parentElement, "::before").backgroundImage,
  }));

  expect(state.contentBackground).toBe("rgba(0, 0, 0, 0)");
  expect(state.atmosphere).toContain("fireartro-drone-show-neversea-show-img-4351");
});

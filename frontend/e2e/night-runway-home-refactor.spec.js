const { test, expect } = require("@playwright/test");

const managedReviews = {
  siteDetails: {
    name: "FireArtRo",
    siteUrl: "https://www.fireartro.ro",
    email: "contact@fireart.ro",
    googleReviewsUrl: "https://www.google.com/maps/place/FireArtRo",
    legalName: "1A BEST EVENTS SRL",
    taxId: "RO37037033",
  },
  testimonials: [
    {
      id: "facebook-live-1",
      name: "Client Facebook",
      quote: "Un spectacol construit atent.",
      source: "Facebook",
      replaceable: false,
    },
    {
      id: "google-live-1",
      name: "Client Google",
      quote: "Execuție foarte bine coordonată.",
      source: "Google",
      replaceable: false,
    },
  ],
};

test.describe("FireArt homepage structural refactor", () => {
  test("routes homepage anchors from gallery and keeps the active indicator consistent", async ({ page }) => {
    await page.goto("/galerie", { waitUntil: "domcontentloaded" });

    const aboutLink = page.getByTestId("nav-link-intro");
    if ((page.viewportSize()?.width || 0) >= 900) {
      await expect(aboutLink).toBeVisible();
      await aboutLink.click();
    } else {
      await expect(page.getByTestId("mobile-menu-trigger")).toBeVisible();
      await page.getByTestId("mobile-menu-trigger").click();
      await page.getByTestId("mobile-nav-link-intro").click();
    }

    await expect(page).toHaveURL(/\/#intro$/);
    await expect(page.locator('[data-testid$="nav-link-intro"][aria-current="page"]')).toHaveCount(1);
    await expect(page.locator("#intro")).toBeInViewport();
  });

  test("keeps review rails completely absent until verified provider data exists", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("home-reviews")).toHaveCount(0);
    await expect(page.getByTestId("facebook-reviews")).toHaveCount(0);
    await expect(page.locator(".fa-footer__lead")).toHaveCount(0);
  });

  test("renders compact opposite-direction review rails only for verified provider data", async ({ page }) => {
    await page.addInitScript((content) => {
      window.localStorage.setItem("fireartro-managed-content-v1", JSON.stringify(content));
    }, managedReviews);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const reviews = page.getByTestId("home-reviews");
    await expect(reviews).toBeVisible();
    await expect(reviews.locator("h2")).toHaveCount(0);
    await expect(reviews.locator("[data-review-provider='facebook']")).toHaveAttribute("data-direction", "right-to-left");
    await expect(reviews.locator("[data-review-provider='google']")).toHaveAttribute("data-direction", "left-to-right");
    await expect(reviews.locator("[data-review-card]")).toHaveCount(2);
    await expect(reviews.getByRole("link", { name: /Facebook/i })).toBeVisible();
    await expect(reviews.getByRole("link", { name: /Google/i })).toBeVisible();

    await expect(reviews).toHaveClass(/fa-page-reviews/);
    await expect(reviews.locator("xpath=ancestor::footer[contains(@class, 'fa-footer')]")).toHaveCount(0);
    await expect(reviews.locator("xpath=following-sibling::footer[1]")).toHaveCount(1);
  });

  test("places connected reviews immediately before the footer on every public page", async ({ page }) => {
    await page.addInitScript((content) => {
      window.localStorage.setItem("fireartro-managed-content-v1", JSON.stringify(content));
    }, managedReviews);

    for (const route of ["/", "/galerie", "/pachete", "/intrebari-frecvente", "/contact", "/confidentialitate"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const reviews = page.getByTestId("home-reviews");
      await expect(reviews).toBeVisible();
      await expect(reviews.locator("xpath=following-sibling::footer[1]")).toHaveCount(1);
      await expect(reviews.locator("xpath=ancestor::footer[contains(@class, 'fa-footer')]")).toHaveCount(0);
    }
  });

  test("centers the package statement and uses responsive media-led package cards", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packages = page.getByTestId("home-packages");
    const reveal = page.getByTestId("package-reveal-copy");
    await expect(reveal).toContainText(/Trei moduri de a\s*aprinde noaptea\./);
    await expect(reveal).toHaveCSS("text-align", "center");
    await expect(packages.locator("[data-package-slab]")).toHaveCount(3);

    const cards = packages.locator("[data-package-slab]");
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(220);
      const radius = Number.parseFloat(await card.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
      expect(radius).toBeGreaterThanOrEqual(14);
      await expect(card.locator("[data-package-play]")).toBeAttached();
    }
  });

  test("keeps the gallery handoff balanced on phone and tablet viewports", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 834, height: 1194 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const handoff = page.getByTestId("gallery-package-handoff");
      const card = handoff.locator(".fa-packages__handoff-card");
      const outro = handoff.locator(".fa-packages__handoff-outro");
      const cardBox = await card.boundingBox();
      const outroBox = await outro.boundingBox();

      expect(Math.abs(cardBox.width - viewport.width / 2)).toBeLessThanOrEqual(2);
      expect(Math.abs(outroBox.width - viewport.width / 2)).toBeLessThanOrEqual(2);
      await expect(outro.locator(".fa-work__outro-inner")).toHaveCSS("text-align", "center");
    }
  });

  test("uses a concise brief after the conditional reviews slot and a quiet directory footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const brief = page.getByTestId("home-brief");
    await expect(brief).toContainText(/Spune-ne ce sărbătorești\.\s*Noi aprindem restul\./);
    await expect(brief.getByRole("link", { name: /conversația/i })).toHaveAttribute("href", "/contact");

    const footer = page.getByTestId("night-runway-footer");
    await expect(footer.locator(".fa-footer__lead")).toHaveCount(0);
    await expect(footer.getByRole("navigation", { name: "Explorează" })).toBeVisible();
    await expect(footer.getByRole("navigation", { name: "Urmărește" })).toBeVisible();
    await expect(footer.getByText("Drone show, artificii și efecte construite pentru momentul potrivit.")).toBeVisible();
  });
});

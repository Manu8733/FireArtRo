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

const necessaryConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: "2026-08-31T00:00:00.000Z",
  expiresAt: "2099-08-31T00:00:00.000Z",
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

  test("uses a catalog drone image for the first home gallery card", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("home-gallery").locator("[data-gallery-item] img").first())
      .toHaveAttribute("src", /fireartro-drone-show-focsani-dji-0768-enhanced-nr\.webp/);
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

  test("lays out the text-only package triptych without viewport overflow", async ({ page }) => {
    await page.addInitScript((consent) => {
      window.localStorage.setItem("fireartro-cookie-consent-v1", JSON.stringify(consent));
    }, necessaryConsent);

    for (const viewport of [
      { width: 1440, height: 900, columns: true },
      { width: 1024, height: 768, columns: true },
      { width: 834, height: 1194, columns: false },
      { width: 430, height: 932, columns: false },
      { width: 390, height: 844, columns: false },
      { width: 844, height: 390, columns: false },
      { width: 568, height: 320, columns: false },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const packages = page.getByTestId("home-packages");
      const boxes = await packages.locator("[data-package-panel]").evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }),
      );
      expect(boxes).toHaveLength(3);

      if (viewport.columns) {
        expect(Math.max(...boxes.map((box) => box.y)) - Math.min(...boxes.map((box) => box.y))).toBeLessThan(4);
      } else {
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 2);
        expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 2);
      }

      const width = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

    const packages = page.getByTestId("home-packages");
    const panels = packages.locator("[data-package-panel]");
    await expect(panels).toHaveCount(3);
    await packages.scrollIntoViewIfNeeded();

    for (const panel of await panels.all()) {
      const box = await panel.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(391);
      await expect(panel.getByRole("button", { name: /cere ofertă/i })).toBeVisible();
    }
    const zoomWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(zoomWidth.scroll).toBeLessThanOrEqual(zoomWidth.client + 1);
  });

  test("keeps the desktop package triptych header and scene compact", async ({ page }) => {
    const viewport = { width: 1138, height: 872 };
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const metrics = await page.getByTestId("home-packages").evaluate((section) => {
      const sectionRect = section.getBoundingClientRect();
      const header = section.querySelector(".fa-packages__header").getBoundingClientRect();
      const heading = section.querySelector("h2").getBoundingClientRect();
      const triptych = section.querySelector("[data-package-triptych]").getBoundingClientRect();
      const panelHeights = Array.from(section.querySelectorAll("[data-package-panel]"), (panel) => (
        panel.getBoundingClientRect().height
      ));
      const targetSizes = Array.from(section.querySelectorAll("a[href], button:not([disabled])"), (target) => {
        const rect = target.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });

      return {
        sectionHeight: sectionRect.height,
        paddingTop: Number.parseFloat(getComputedStyle(section).paddingTop),
        headingFontSize: Number.parseFloat(getComputedStyle(section.querySelector("h2")).fontSize),
        headerHeight: header.height,
        triptychTopOffset: triptych.top - sectionRect.top,
        tallestPanel: Math.max(...panelHeights),
        targetSizes,
      };
    });

    expect(metrics.paddingTop).toBeLessThanOrEqual(84);
    expect(metrics.headingFontSize).toBeLessThanOrEqual(56);
    expect(metrics.headerHeight).toBeLessThanOrEqual(viewport.height * 0.24);
    expect(metrics.triptychTopOffset).toBeLessThanOrEqual(viewport.height * 0.36);
    expect(metrics.tallestPanel).toBeLessThanOrEqual(viewport.height * 0.66);
    expect(metrics.sectionHeight).toBeLessThanOrEqual(viewport.height * 1.25);
    expect(metrics.targetSizes).toHaveLength(4);
    for (const target of metrics.targetSizes) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("keeps every mobile gallery panel readable at full viewport width", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 834, height: 1194 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const panels = page.getByTestId("home-gallery").locator("[data-gallery-panel]");
      await expect(panels).toHaveCount(4);
      for (const panel of await panels.all()) {
        const box = await panel.boundingBox();
        expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(2);
      }
    }
  });

  test("keeps gallery photos framed for touch landscape phones", async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const figures = page.getByTestId("home-gallery").locator("[data-gallery-item] figure");
    for (const figure of await figures.all()) {
      const box = await figure.boundingBox();
      expect(box.width / box.height, "landscape phone photos should not become ultra-wide crops").toBeLessThanOrEqual(2.1);
      expect(box.height, "landscape phone photos should retain a substantial frame").toBeGreaterThanOrEqual(250);
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

const { test, expect } = require("@playwright/test");

const openGallery = async (page, viewport = { width: 1440, height: 900 }) => {
  await page.setViewportSize(viewport);
  const baseUrl = process.env.GALLERY_BASE_URL || "";
  await page.goto(`${baseUrl}/galerie`, { waitUntil: "domcontentloaded" });
  const necessaryCookies = page.getByRole("button", { name: "Doar necesare" });
  if (await necessaryCookies.isVisible().catch(() => false)) await necessaryCookies.click();
  await expect(page.getByTestId("gallery-grid")).toBeVisible();
  const firstImage = page.getByTestId("gallery-card").first().locator("img");
  await expect(firstImage).toBeVisible();
  await expect.poll(() => firstImage.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
};

test.describe("Editorial mosaic gallery", () => {
  test("renders a compact adaptive photo mosaic", async ({ page }) => {
    await openGallery(page);

    await expect(page.locator("main[data-design='editorial-mosaic']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Galerie" })).toHaveCount(1);
    await expect(page.getByTestId("gallery-card")).toHaveCount(50);
    await expect(page.locator(".nr-gallery-card__copy strong")).toHaveCount(0);

    const cards = page.getByTestId("gallery-card");
    for (let index = 0; index < Math.min(await cards.count(), 12); index += 1) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator("img").evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    }

    const metrics = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-testid='gallery-card']")];
      const inspectedCards = cards.slice(0, 12);
      const images = inspectedCards.map((card) => card.querySelector("img"));
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        rows: new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size,
        naturalRatios: images.map((image) => image.naturalWidth / image.naturalHeight),
        cardRatios: inspectedCards.map((card) => {
          const box = card.getBoundingClientRect();
          return box.width / box.height;
        }),
      };
    });

    expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.rows).toBeGreaterThan(1);
    metrics.cardRatios.forEach((ratio, index) => {
      const expected = Math.min(2.25, Math.max(0.56, metrics.naturalRatios[index]));
      expect(Math.abs(ratio - expected)).toBeLessThan(0.08);
    });
  });

  test("publishes a clean, SEO-named FireArtRo photo catalog", async ({ page }) => {
    await openGallery(page);

    const cards = page.getByTestId("gallery-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(40);

    const sources = await cards.locator("img").evaluateAll((images) => images.map((image) => image.getAttribute("src") || ""));
    expect(sources.filter((source) => source.includes("/media/gallery/fireartro-") && source.endsWith(".webp"))).toHaveLength(49);
  });

  test("exposes only the curated fireworks and drone categories", async ({ page }) => {
    await openGallery(page);

    const labels = await page.getByTestId("gallery-filters").locator("button span").allTextContents();
    expect(labels).toEqual([
      "Toate",
      "Artificii de zi",
      "Artificii de noapte",
      "Drone show",
    ]);
  });

  test("migrates an existing Admin catalog without removing a custom photograph", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("fireartro-managed-content-v1", JSON.stringify({
        mediaItems: [{
          id: "admin-custom-photo",
          type: "image",
          title: "Fotografie administrata",
          category: "Custom",
          thumbnail: "/media/fireworks-sky.webp",
          src: "/media/fireworks-sky.webp",
          alt: "Fotografie incarcata prin Admin",
          order: 999,
        }],
      }));
    });

    await openGallery(page);
    await expect(page.getByTestId("gallery-card")).toHaveCount(51);
    await expect(page.locator('[data-testid="gallery-card"][data-media-id="admin-custom-photo"]')).toBeVisible();
  });

  test("does not resurrect removed photographs during an Admin catalog migration", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("fireartro-managed-content-v1", JSON.stringify({
        mediaCatalogVersion: "fireartro-gallery-2026-v2",
        mediaItems: [
          {
            id: "gallery-import-137",
            type: "image",
            title: "Fotografie eliminata",
            category: "Nunta",
            thumbnail: "/media/gallery/fireartro-nunta-moment-special-137.webp",
            src: "/media/gallery/fireartro-nunta-moment-special-137.webp",
            alt: "Fotografie veche eliminata din catalog",
            order: 137,
          },
          {
            id: "admin-custom-photo",
            type: "image",
            title: "Fotografie administrata",
            category: "Custom",
            thumbnail: "/media/fireworks-sky.webp",
            src: "/media/fireworks-sky.webp",
            alt: "Fotografie incarcata prin Admin",
            order: 999,
          },
        ],
      }));
    });

    await openGallery(page);
    await expect(page.locator('[data-testid="gallery-card"][data-media-id="gallery-import-137"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="gallery-card"][data-media-id="admin-custom-photo"]')).toBeVisible();
  });

  test("filters the collection and keeps URL state", async ({ page }) => {
    await openGallery(page);
    const filters = page.getByTestId("gallery-filters");
    const allButton = filters.getByRole("button", { name: /^Toate/ });
    await expect(allButton).toHaveAttribute("aria-pressed", "true");

    const initialCount = await page.getByTestId("gallery-card").count();
    const categoryButton = filters.getByRole("button").nth(1);
    await categoryButton.click();

    await expect(page).toHaveURL(/filtru=/);
    await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
    expect(await page.getByTestId("gallery-card").count()).toBeLessThanOrEqual(initialCount);
  });

  test("opens a distraction-free image preview", async ({ page }) => {
    await openGallery(page);
    await page.getByTestId("gallery-card").first().locator("button").click();

    const dialog = page.locator(".nr-gallery-lightbox[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/media=/);
    await expect(dialog.locator("img")).toHaveCount(1);
    await expect(dialog.locator(".nr-gallery-lightbox__copy")).toHaveCount(0);
    await expect(dialog.locator(".nr-gallery-lightbox__nav")).toHaveCount(0);
    await expect(dialog.locator("button:visible")).toHaveCount(0);

    const ratios = await dialog.evaluate((element) => {
      const image = element.querySelector("img");
      const frame = element.getBoundingClientRect();
      return {
        natural: image.naturalWidth / image.naturalHeight,
        frame: frame.width / frame.height,
      };
    });
    expect(Math.abs(ratios.frame - ratios.natural)).toBeLessThan(0.02);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/media=/);
  });

  test("stays readable and overflow-free on mobile", async ({ page }) => {
    await openGallery(page, { width: 390, height: 844 });

    const metrics = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-testid='gallery-card']")];
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        cardWidths: cards.map((card) => card.getBoundingClientRect().width),
        cardLefts: cards.map((card) => card.getBoundingClientRect().left),
      };
    });

    expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
    metrics.cardWidths.forEach((width) => expect(width).toBeGreaterThan(330));
    metrics.cardLefts.forEach((left) => expect(left).toBeGreaterThanOrEqual(15));

    const firstCard = page.getByTestId("gallery-card").first();
    await firstCard.locator("button").click();
    const dialog = page.locator(".nr-gallery-lightbox[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toBeVisible();
  });

  test("uses economical image loading", async ({ page }) => {
    await openGallery(page);
    const cards = page.getByTestId("gallery-card");
    await expect(cards.nth(0).locator("img")).toHaveAttribute("loading", "eager");
    await expect(cards.nth(3).locator("img")).toHaveAttribute("loading", "eager");
    await expect(cards.nth(4).locator("img")).toHaveAttribute("loading", "lazy");
  });
});

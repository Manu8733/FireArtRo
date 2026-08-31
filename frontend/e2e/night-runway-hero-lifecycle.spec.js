const { test, expect } = require("@playwright/test");

const heroVideoState = (node) => ({
  currentSrc: node.currentSrc,
  currentTime: node.currentTime,
  duration: node.duration,
  paused: node.paused,
  readyState: node.readyState,
  networkState: node.networkState,
  error: node.error ? node.error.code : null,
});

async function expectPlaying(video) {
  await expect.poll(() => video.evaluate((node) => node.readyState), {
    timeout: 25_000,
    message: "hero video should load metadata",
  }).toBeGreaterThanOrEqual(2);
  try {
    await expect.poll(() => video.evaluate((node) => node.paused), {
      timeout: 25_000,
      message: "hero video should not remain paused",
    }).toBe(false);
  } catch (error) {
    console.log("hero video final state", await video.evaluate(heroVideoState));
    throw error;
  }
}

async function expectProgress(video) {
  const before = await video.evaluate(heroVideoState);
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  const after = await video.evaluate(heroVideoState);
  const continued = after.currentTime > before.currentTime + 0.1;
  const looped = before.duration > 0 && before.currentTime > before.duration - 0.75 && after.currentTime < 1;
  expect(after.paused).toBe(false);
  expect(continued || looped).toBe(true);
  expect(after.error).toBeNull();
}

test.describe("hero video lifecycle", () => {
  test("continues playback after a phone rotates into landscape", async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const video = page.locator("[data-testid='hero-section'] video");
    await expect.poll(() => video.evaluate((node) => node.currentSrc)).toMatch(
      /fireart-drone-fireworks-cinematic-mobile-web\.mp4/,
    );
    await expectPlaying(video);

    await page.setViewportSize({ width: 932, height: 430 });
    await expect.poll(() => video.evaluate((node) => node.currentSrc)).toMatch(
      /fireart-drone-fireworks-cinematic-landscape\.mp4/,
    );
    await expect(video).toHaveAttribute("data-media-variant", "landscape");
    await expectPlaying(video);

    await expectProgress(video);
  });

  test("continues playback after leaving the homepage and returning", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const video = page.locator("[data-testid='hero-section'] video");
    await expectPlaying(video);
    const necessaryCookies = page.getByRole("button", { name: "Doar necesare" });
    if (await necessaryCookies.isVisible().catch(() => false)) await necessaryCookies.click();
    await page.getByTestId("hero-secondary-cta").click();
    await expect(page).toHaveURL(/\/galerie$/);
    await expect(page.getByTestId("route-shutter")).toHaveAttribute("data-active", "false");

    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/$/);
    const returnedVideo = page.locator("[data-testid='hero-section'] video");
    await expect(returnedVideo).toHaveCount(1);
    await expect(page.getByTestId("route-shutter")).toHaveAttribute("data-active", "false");
    await expect.poll(() => page.getByTestId("route-shutter").evaluate((node) => getComputedStyle(node).visibility))
      .toBe("hidden");
    await expectPlaying(returnedVideo);

    await expectProgress(returnedVideo);
  });

  test("releases the hero video offscreen and restores it when returning", async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const video = page.locator("[data-testid='hero-section'] video");
    await expectPlaying(video);
    await page.evaluate(() => window.scrollTo(0, document.querySelector("[data-testid='hero-section']").offsetHeight + 120));

    await expect.poll(() => video.evaluate((node) => ({
      paused: node.paused,
      source: node.getAttribute("src"),
    }))).toEqual({ paused: true, source: null });

    await page.evaluate(() => window.scrollTo(0, 0));
    await expectPlaying(video);
  });

  test("restarts playback after the page is shown again", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const video = page.locator("[data-testid='hero-section'] video");
    await expectPlaying(video);

    await video.evaluate((node) => {
      node.removeAttribute("autoplay");
      node.pause();
      window.dispatchEvent(new Event("pagehide"));
    });
    await expect.poll(() => video.evaluate((node) => node.paused)).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));

    await expect.poll(() => video.evaluate((node) => node.paused), {
      timeout: 5_000,
      message: "hero video should restart after pageshow",
    }).toBe(false);
  });

  test("recovers playback when the window regains focus or connectivity", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const video = page.locator("[data-testid='hero-section'] video");
    await expectPlaying(video);

    await video.evaluate((node) => {
      node.removeAttribute("autoplay");
      node.pause();
      window.dispatchEvent(new Event("focus"));
    });
    await expectPlaying(video);

    await video.evaluate((node) => {
      node.pause();
      window.dispatchEvent(new Event("online"));
    });
    await expectPlaying(video);
  });

  test("uses the optimized landscape source on a tablet in landscape", async ({ page }) => {
    await page.setViewportSize({ width: 1194, height: 834 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const video = page.locator("[data-testid='hero-section'] video");
    await expect.poll(() => video.evaluate((node) => node.currentSrc)).toMatch(
      /fireart-drone-fireworks-cinematic-landscape\.mp4/,
    );
    await expect(video).toHaveAttribute("data-media-variant", "landscape");
    await expectPlaying(video);
  });

  test("keeps the complete hero copy inside every supported viewport", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const viewports = [
      [320, 568],
      [375, 667],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [932, 430],
      [1366, 768],
      [1366, 1024],
    ];

    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      const overflow = await page.locator("[data-testid='hero-section']").evaluate((hero) => {
        const viewportWidth = document.documentElement.clientWidth;
        const nodes = hero.querySelectorAll(
          ".nr-hero__eyebrow, .nr-hero__title, .nr-hero__title-line, "
            + ".nr-hero__keyword-sizer, .nr-hero__keyword-active, "
            + ".nr-hero__description, .nr-hero__actions",
        );

        return [...nodes]
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return { selector: node.className, left: rect.left, right: rect.right };
          })
          .filter(({ left, right }) => left < -1 || right > viewportWidth + 1);
      });

      expect(overflow, `hero copy overflow at ${width}x${height}`).toEqual([]);
    }
  });
});

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
  await expect.poll(() => video.evaluate((node) => node.paused), {
    timeout: 25_000,
    message: "hero video should not remain paused",
  }).toBe(false);
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
      /fireart-drone-fireworks-cinematic-mobile\.mp4/,
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
});

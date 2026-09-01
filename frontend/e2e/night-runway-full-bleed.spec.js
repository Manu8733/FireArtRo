const { expect, test } = require("@playwright/test");

test("hero is full-bleed and cinematic gallery scales on a 32:9 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 5120, height: 1440 });
  await page.goto("/#acasa");

  const video = page.locator(".hero-media-surface");
  await expect(video).toBeVisible();

  const geometry = await page.evaluate(() => {
    const heroNode = document.querySelector(".nr-hero");
    const videoNode = document.querySelector(".hero-media-surface");
    const stageNode = document.querySelector(".hero-video-stage");
    const galleryNode = document.querySelector(".fa-work__viewport");

    if (!heroNode || !videoNode || !stageNode || !galleryNode) {
      throw new Error("Expected hero and gallery nodes to be present");
    }

    const heroRect = heroNode.getBoundingClientRect();
    const videoRect = videoNode.getBoundingClientRect();
    const backdrop = getComputedStyle(stageNode, "::before");

    return {
      hero: { width: heroRect.width, height: heroRect.height },
      video: { width: videoRect.width, height: videoRect.height },
      fit: getComputedStyle(videoNode).objectFit,
      backdropOpacity: Number.parseFloat(backdrop.opacity || "0"),
      galleryWidth: galleryNode.getBoundingClientRect().width,
      documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  expect(Math.abs(geometry.hero.width - geometry.video.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.hero.height - geometry.video.height)).toBeLessThanOrEqual(1);
  expect(geometry.fit).toBe("cover");
  expect(geometry.backdropOpacity).toBe(0);
  expect(geometry.galleryWidth).toBeGreaterThan(1440);
  expect(geometry.galleryWidth).toBeLessThanOrEqual(2560);
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
});

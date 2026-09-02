const { expect, test } = require("@playwright/test");

const scaleCases = [
  { width: 1512, height: 982, navMin: 12, bodyMin: 14, heroTitleMin: 72, galleryTitleMin: 52, shellRatioMin: 0.9 },
  { width: 2560, height: 1440, navMin: 15, bodyMin: 16, heroTitleMin: 104, galleryTitleMin: 88, shellRatioMin: 0.75 },
  { width: 3840, height: 2160, navMin: 18, bodyMin: 18, heroTitleMin: 128, galleryTitleMin: 128, shellRatioMin: 0.7 },
  { width: 5120, height: 1440, navMin: 18, bodyMin: 18, heroTitleMin: 128, galleryTitleMin: 128, shellRatioMin: 0.6 },
];

test("large viewports retain deliberate visual scale without stretching readable content", async ({ page }) => {
  await page.goto("/#acasa", { waitUntil: "domcontentloaded" });

  for (const viewport of scaleCases) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const metrics = await page.evaluate(() => {
      const number = (selector) => {
        const node = document.querySelector(selector);
        if (!node) throw new Error(`Missing scale probe: ${selector}`);
        return Number.parseFloat(getComputedStyle(node).fontSize);
      };
      const shell = document.querySelector(".fa-packages .nr-shell");
      if (!shell) throw new Error("Missing representative layout shell");

      return {
        nav: number(".site-navbar-links > a"),
        body: Number.parseFloat(getComputedStyle(document.body).fontSize),
        heroTitle: number(".nr-hero__title"),
        galleryTitle: number(".fa-work__intro h2"),
        shellWidth: shell.getBoundingClientRect().width,
        viewportWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    const label = `${viewport.width}x${viewport.height}`;
    expect(metrics.nav, `${label} navigation`).toBeGreaterThanOrEqual(viewport.navMin);
    expect(metrics.body, `${label} body`).toBeGreaterThanOrEqual(viewport.bodyMin);
    expect(metrics.heroTitle, `${label} hero title`).toBeGreaterThanOrEqual(viewport.heroTitleMin);
    expect(metrics.galleryTitle, `${label} gallery title`).toBeGreaterThanOrEqual(viewport.galleryTitleMin);
    expect(metrics.shellWidth, `${label} layout shell`).toBeGreaterThanOrEqual(
      metrics.viewportWidth * viewport.shellRatioMin,
    );
    expect(metrics.overflow, `${label} horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

const { expect, test } = require("@playwright/test");

async function inspectVideoFrame(page, src, timestamp) {
  return page.evaluate(async ({ mediaSrc, at }) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.style.cssText = "position:fixed;left:-99999px;top:0;width:1px;height:1px";
    document.body.appendChild(video);

    const waitFor = (eventName) => new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(`Timed out waiting for ${eventName}: ${mediaSrc}`)), 10_000);
      video.addEventListener(eventName, () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
      video.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error(`Could not decode ${mediaSrc}`));
      }, { once: true });
    });

    try {
      const metadataReady = waitFor("loadedmetadata");
      video.src = mediaSrc;
      video.load();
      await metadataReady;

      const frameReady = waitFor("seeked");
      video.currentTime = Math.min(at, Math.max(0, video.duration - 0.05));
      await frameReady;

      const width = 480;
      const height = Math.round((video.videoHeight / video.videoWidth) * width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(video, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const isLandscape = width / height > 1;

      const emberColumnCounts = new Uint16Array(width);
      const emberRowCounts = new Uint16Array(height);
      let emberPixels = 0;

      const emberTop = Math.floor(height * (isLandscape ? 0.52 : 0.7));
      const emberBottom = Math.ceil(height * (isLandscape ? 0.68 : 0.94));
      for (let y = emberTop; y < emberBottom; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const offset = (y * width + x) * 4;
          const red = pixels[offset];
          const green = pixels[offset + 1];
          const blue = pixels[offset + 2];
          const isEmber = red > 145
            && red > green * 1.35
            && red - blue > 55
            && green > 35
            && green < 175
            && blue < 145;
          if (!isEmber) continue;
          emberColumnCounts[x] += 1;
          emberRowCounts[y] += 1;
          emberPixels += 1;
        }
      }

      const columnThreshold = Math.max(2, Math.floor(height * 0.012));
      const rowThreshold = Math.max(3, Math.floor(width * 0.006));
      const emberColumns = Array.from(emberColumnCounts, (count, index) => ({ count, index }))
        .filter(({ count }) => count > columnThreshold)
        .map(({ index }) => index);
      const emberRows = Array.from(emberRowCounts, (count, index) => ({ count, index }))
        .filter(({ count }) => count > rowThreshold)
        .map(({ index }) => index);

      const edgeScore = (fromX, toX) => {
        let total = 0;
        let samples = 0;
        for (let y = 1; y < height - 1; y += 2) {
          for (let x = Math.max(1, fromX); x < Math.min(width - 1, toX); x += 2) {
            const offset = (y * width + x) * 4;
            const right = (y * width + x + 1) * 4;
            const down = ((y + 1) * width + x) * 4;
            for (let channel = 0; channel < 3; channel += 1) {
              total += Math.abs(pixels[offset + channel] - pixels[right + channel]);
              total += Math.abs(pixels[offset + channel] - pixels[down + channel]);
              samples += 2;
            }
          }
        }
        return total / Math.max(1, samples);
      };

      const edgeWidth = Math.floor(width * 0.12);
      const edgeDetail = (edgeScore(0, edgeWidth) + edgeScore(width - edgeWidth, width)) / 2;
      const centerDetail = edgeScore(Math.floor(width * 0.35), Math.ceil(width * 0.65));

      return {
        width,
        height,
        emberPixels,
        emberBox: emberColumns.length && emberRows.length ? {
          left: Math.min(...emberColumns) / width,
          right: Math.max(...emberColumns) / width,
          top: Math.min(...emberRows) / height,
          bottom: Math.max(...emberRows) / height,
        } : null,
        edgeDetailRatio: edgeDetail / Math.max(0.001, centerDetail),
      };
    } finally {
      video.removeAttribute("src");
      video.load();
      video.remove();
    }
  }, { mediaSrc: src, at: timestamp });
}

test("the baked combo title stays in the website-safe area in every delivered crop", async ({ page }) => {
  await page.goto("/#acasa", { waitUntil: "domcontentloaded" });

  const landscapeVariants = ["wide", "ultrawide", "tablet-landscape"];
  for (const variant of landscapeVariants) {
    const frame = await inspectVideoFrame(page, `/media/fireart-hero-${variant}.mp4`, 16.7);
    expect(frame.emberPixels, `${variant} ember title signal`).toBeGreaterThan(frame.width * frame.height * 0.003);
    expect(frame.emberBox, `${variant} ember title bounds`).not.toBeNull();
    expect(frame.emberBox.left, `${variant} title must clear the live copy`).toBeGreaterThanOrEqual(0.48);
    expect(frame.emberBox.right, `${variant} title must remain visible`).toBeLessThanOrEqual(0.985);
  }

  const portraitVariants = ["tablet-portrait", "mobile", "mobile-tall"];
  for (const variant of portraitVariants) {
    const frame = await inspectVideoFrame(page, `/media/fireart-hero-${variant}.mp4`, 16.7);
    expect(frame.emberPixels, `${variant} ember title signal`).toBeGreaterThan(frame.width * frame.height * 0.003);
    expect(frame.emberBox, `${variant} ember title bounds`).not.toBeNull();
    expect(frame.emberBox.top, `${variant} title must stay below the live copy`).toBeGreaterThanOrEqual(0.58);
    expect(frame.emberBox.bottom, `${variant} title must remain visible`).toBeLessThanOrEqual(0.92);
  }
});

test("drone photographs retain real edge detail instead of a blurred duplicate", async ({ page }) => {
  await page.goto("/#acasa", { waitUntil: "domcontentloaded" });

  const containedSceneTimes = [3.9, 5.5, 10.7, 13.2, 15.7, 16.7];
  const frames = [];
  for (const timestamp of containedSceneTimes) {
    frames.push(await inspectVideoFrame(page, "/media/fireart-hero-wide.mp4", timestamp));
  }

  const meanEdgeDetail = frames.reduce((total, frame) => total + frame.edgeDetailRatio, 0) / frames.length;
  const visiblyBlurredFrames = frames.filter((frame) => frame.edgeDetailRatio < 0.25).length;

  expect(meanEdgeDetail, "average outer-edge detail").toBeGreaterThanOrEqual(0.34);
  expect(visiblyBlurredFrames, "frames with backdrop-like outer edges").toBeLessThanOrEqual(1);
});

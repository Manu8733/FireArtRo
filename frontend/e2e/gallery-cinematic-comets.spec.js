const { test, expect } = require("@playwright/test");

const baseUrl = process.env.GALLERY_BASE_URL || "";

async function inspectComets(page, viewport, screenshotName) {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/galerie`, { waitUntil: "domcontentloaded" });
  const necessaryCookies = page.getByRole("button", { name: "Doar necesare" });
  if (await necessaryCookies.isVisible().catch(() => false)) await necessaryCookies.click();

  const field = page.locator(".nr-gallery-thread-field");
  await expect(field).toHaveAttribute("data-canvas-state", "running", { timeout: 10_000 });
  await expect(field.locator("canvas")).toHaveCount(1);
  await page.waitForFunction(() => {
    const node = document.querySelector(".nr-gallery-thread-field");
    const progress = Number(node?.dataset.spiralProgress || 0);
    return node?.dataset.spiralPhase === "braid" && progress > 0.5 && progress < 0.67;
  }, null, { timeout: 10_000 });
  await page.screenshot({ path: `../output/playwright/${screenshotName.replace(".png", "-braid.png")}`, fullPage: false });
  await page.waitForFunction(() => {
    const node = document.querySelector(".nr-gallery-thread-field");
    return node?.dataset.spiralPhase === "hold";
  }, null, { timeout: 6_000 });
  await page.screenshot({ path: `../output/playwright/${screenshotName.replace(".png", "-fusion.png")}`, fullPage: false });

  const samples = [];
  for (let index = 0; index < 65; index += 1) {
    samples.push(await field.evaluate((node) => ({
      phase: node.dataset.spiralPhase || "idle",
      progress: Number(node.dataset.spiralProgress || 0),
      travel: Number(node.dataset.encounterTravel || 0),
      spread: Number(node.dataset.helixSpread || 0),
      rotation: Number(node.dataset.helixRotation || 0),
      carrierX: Number(node.dataset.carrierX || 0),
      visible: Number(node.dataset.visibleAgents || 0),
    })));
    await page.waitForTimeout(80);
  }

  const canvasPng = await field.locator("canvas").screenshot();
  const pixels = await page.evaluate(async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const sample = document.createElement("canvas");
    sample.width = 240;
    sample.height = 160;
    const context = sample.getContext("2d");
    context.drawImage(image, 0, 0, sample.width, sample.height);
    const values = context.getImageData(0, 0, sample.width, sample.height).data;
    let lit = 0;
    for (let index = 3; index < values.length; index += 4) {
      if (values[index] > 4 && values[index - 1] + values[index - 2] + values[index - 3] > 24) lit += 1;
    }
    return { sampled: sample.width * sample.height, lit };
  }, `data:image/png;base64,${canvasPng.toString("base64")}`);

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  await page.screenshot({ path: `../output/playwright/${screenshotName}`, fullPage: false });

  return { errors, samples, pixels, layout };
}

for (const scenario of [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
]) {
  test(`${scenario.name} renders a travelling accelerating braid`, async ({ page }) => {
    test.setTimeout(60_000);
    const result = await inspectComets(page, scenario.viewport, `gallery-comets-${scenario.name}.png`);
    const phases = new Set(result.samples.map((sample) => sample.phase));
    const activeSamples = result.samples.filter((sample) => sample.phase !== "idle");
    const carrierXs = activeSamples.map((sample) => sample.carrierX);

    expect(result.errors).toEqual([]);
    expect(result.layout.document).toBeLessThanOrEqual(result.layout.viewport + 1);
    expect(Math.min(...result.samples.map((sample) => sample.visible))).toBeGreaterThanOrEqual(2);
    expect(phases.has("braid")).toBeTruthy();
    expect(phases.has("fuse") || phases.has("hold")).toBeTruthy();
    expect(Math.max(...activeSamples.map((sample) => sample.travel))).toBeGreaterThan(0.75);
    expect(Math.max(...activeSamples.map((sample) => sample.spread))).toBeGreaterThan(scenario.name === "mobile" ? 0.22 : 0.35);
    expect(Math.max(...carrierXs) - Math.min(...carrierXs)).toBeGreaterThan(scenario.name === "mobile" ? 0.45 : 0.7);
    expect(Math.max(...activeSamples.map((sample) => sample.rotation))).toBeGreaterThan(0.55);
    expect(result.pixels.lit).toBeGreaterThan(20);
  });
}

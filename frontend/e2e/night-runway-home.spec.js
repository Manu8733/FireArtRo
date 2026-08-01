const { test, expect } = require("@playwright/test");

const responsiveViewports = [
  { width: 1440, height: 900 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
];

test.describe("FireArt scroll canvas landing", () => {
  test("preserves the existing hero before the redesigned story", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hero = page.getByTestId("hero-section");
    await expect(hero).toBeVisible();
    await expect(hero.locator("video")).toHaveCount(1);
    await expect(hero.locator("source")).toHaveAttribute("src", /hero-loop-(aerial|fireworks|show)\.mp4/);
    await expect(page.getByTestId("hero-primary-cta")).toHaveAttribute("href", /contact/);
    await expect(page.getByTestId("hero-secondary-cta")).toHaveAttribute("href", "/galerie");
  });

  test("types left to right, deletes right to left, and keeps the hero geometry stable", async ({ page }) => {
    await page.setViewportSize({ width: 868, height: 698 });
    await page.clock.install({ time: new Date("2026-08-01T12:00:00.000Z") });
    await page.clock.pauseAt(new Date("2026-08-01T12:00:00.100Z"));
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const title = page.getByRole("heading", { level: 1, name: "Spectacole în lumină." });
    const keyword = page.locator(".nr-hero__keyword");
    const primary = page.getByTestId("hero-primary-cta");

    await expect(title).toBeVisible();
    await expect(keyword).toHaveText("");

    await page.clock.runFor(450);
    await expect(keyword).toHaveText("l");
    await page.clock.runFor(85);
    await expect(keyword).toHaveText("lu");
    await page.clock.runFor(5 * 85);
    await expect(keyword).toHaveText("lumină.");

    const firstTitleBox = await title.boundingBox();
    const firstCtaBox = await primary.boundingBox();

    await page.clock.runFor(3200 + 55);
    await expect(keyword).toHaveText("lumină");
    await page.clock.runFor(55);
    await expect(keyword).toHaveText("lumin");

    for (const expectedWord of ["lumi", "lum", "lu", "l", ""]) {
      await page.clock.runFor(55);
      await expect(keyword).toHaveText(expectedWord);
    }
    await page.clock.runFor(180);
    await expect(keyword).toHaveText("");
    await page.clock.runFor(85);
    await expect(keyword).toHaveText("m");
    for (const expectedWord of ["mi", "miș", "mișc", "mișca", "mișcar", "mișcare", "mișcare."]) {
      await page.clock.runFor(85);
      await expect(keyword).toHaveText(expectedWord);
    }

    const secondTitleBox = await title.boundingBox();
    const secondCtaBox = await primary.boundingBox();

    expect(Math.abs((firstTitleBox?.height || 0) - (secondTitleBox?.height || 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((firstCtaBox?.y || 0) - (secondCtaBox?.y || 0))).toBeLessThanOrEqual(1);
  });

  test("renders a static accessible hero title when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1, name: "Spectacole în lumină." })).toBeVisible();
    await expect(page.locator(".nr-hero__keyword")).toHaveText("lumină.");
    await expect(page.locator(".nr-hero__caret")).toHaveCount(0);
    await page.waitForTimeout(1200);
    await expect(page.locator(".nr-hero__keyword")).toHaveText("lumină.");
  });

  test("uses a centered editorial hero composition without framed actions", async ({ page }) => {
    await page.setViewportSize({ width: 868, height: 698 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const eyebrow = page.locator(".nr-hero__eyebrow");
    const primary = page.getByTestId("hero-primary-cta");
    const secondary = page.getByTestId("hero-secondary-cta");
    const socialLinks = page.getByTestId("social-dock").locator(".social-dock-link");

    const eyebrowBox = await eyebrow.boundingBox();
    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();

    expect(eyebrowBox?.y).toBeGreaterThanOrEqual(125);
    expect(Math.abs((primaryBox?.y || 0) - (secondaryBox?.y || 0))).toBeLessThan(2);
    await expect(primary).toHaveCSS("border-top-width", "0px");
    await expect(primary).toHaveCSS("clip-path", "none");
    await expect(secondary).toHaveCSS("border-top-width", "0px");
    await expect(socialLinks.first()).toHaveCSS("border-top-width", "0px");
    await expect(socialLinks.first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("keeps the looping hero video full bleed on wide desktop screens", async ({ page }) => {
    await page.setViewportSize({ width: 1914, height: 905 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const heroBox = await page.getByTestId("hero-section").boundingBox();
    const stageBox = await page.locator(".hero-video-stage").boundingBox();
    const videoBox = await page.locator(".hero-media-video").boundingBox();

    expect(stageBox?.x).toBeLessThanOrEqual((heroBox?.x || 0) + 1);
    expect(stageBox?.y).toBeLessThanOrEqual((heroBox?.y || 0) + 1);
    expect((stageBox?.x || 0) + (stageBox?.width || 0)).toBeGreaterThanOrEqual((heroBox?.x || 0) + (heroBox?.width || 0) - 1);
    expect((stageBox?.y || 0) + (stageBox?.height || 0)).toBeGreaterThanOrEqual((heroBox?.y || 0) + (heroBox?.height || 0) - 1);
    expect(videoBox?.x).toBeLessThanOrEqual((heroBox?.x || 0) + 1);
    expect((videoBox?.x || 0) + (videoBox?.width || 0)).toBeGreaterThanOrEqual((heroBox?.x || 0) + (heroBox?.width || 0) - 1);
    await expect(page.locator(".hero-media-video")).toHaveCSS("object-fit", "cover");
  });

  test("uses a larger right-shifted desktop title without moving the mobile gutter", async ({ page }) => {
    await page.setViewportSize({ width: 1914, height: 905 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const desktopTitle = page.locator(".nr-hero__title");
    const desktopTitleBox = await desktopTitle.boundingBox();
    const desktopFontSize = Number.parseFloat(await desktopTitle.evaluate((node) => getComputedStyle(node).fontSize));

    expect(desktopTitleBox?.x).toBeGreaterThanOrEqual(250);
    expect(desktopFontSize).toBeGreaterThanOrEqual(96);

    await page.setViewportSize({ width: 430, height: 932 });
    await page.reload({ waitUntil: "domcontentloaded" });
    const mobileTitleBox = await page.locator(".nr-hero__title").boundingBox();

    expect(mobileTitleBox?.x).toBeLessThanOrEqual(24);
  });

  test("scales the desktop navigation and social controls without adding frames", async ({ page }) => {
    await page.setViewportSize({ width: 1157, height: 930 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const navLink = page.locator(".site-navbar-links > a").first();
    const logo = page.locator(".site-navbar-brand img").first();
    const socialLink = page.getByTestId("social-dock").locator(".social-dock-link").first();
    const socialIcon = socialLink.locator(".social-dock-icon");
    const navFontSize = Number.parseFloat(await navLink.evaluate((node) => getComputedStyle(node).fontSize));
    const logoBox = await logo.boundingBox();
    const socialLinkBox = await socialLink.boundingBox();
    const socialIconBox = await socialIcon.boundingBox();

    expect(navFontSize).toBeGreaterThanOrEqual(12);
    expect(logoBox?.height).toBeGreaterThanOrEqual(36);
    expect(socialLinkBox?.width).toBeGreaterThanOrEqual(48);
    expect(socialIconBox?.width).toBeGreaterThanOrEqual(18);
    await expect(socialLink).toHaveCSS("border-top-width", "0px");
    await expect(socialLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("balances three desktop navigation links on each side of the home logo", async ({ page }) => {
    await page.setViewportSize({ width: 1157, height: 930 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const navbar = page.getByTestId("main-navbar");
    await expect(navbar.locator(".site-navbar-links-left > a")).toHaveCount(3);
    await expect(navbar.locator(".site-navbar-links-right > a")).toHaveCount(3);
    await expect(navbar.getByTestId("nav-link-acasa")).toHaveCount(0);
    await expect(navbar.getByTestId("nav-logo")).toHaveAttribute("href", "/#acasa");
    await expect(navbar.locator(".site-navbar-links-left > a")).toHaveText(["Despre noi", "Servicii", "Pachete"]);
    await expect(navbar.locator(".site-navbar-links-right > a")).toHaveText(["Galerie", "Întrebări", "Contact"]);
  });

  test("removes the redundant scroll prompt from the hero", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator(".nr-hero__scroll")).toHaveCount(0);
  });

  test("keeps the hero eyebrow unframed and without a decorative leading rule", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const eyebrow = page.locator(".nr-hero__eyebrow");
    const leadingRuleContent = await eyebrow.evaluate((node) => getComputedStyle(node, "::before").content);

    expect(leadingRuleContent).toBe("none");
  });

  test("uses the approved gallery to packages to team to partners to brief order", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const order = await page.locator("[data-home-scene]").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-home-scene")),
    );

    expect(order).toEqual(["gallery", "packages", "team", "partners", "brief"]);
    await expect(page.getByTestId("home-gallery").locator("[data-gallery-item]")).toHaveCount(3);
    await expect(page.getByTestId("home-packages").locator("[data-package-slab]")).toHaveCount(3);
    await expect(page.getByTestId("home-team").locator("[data-team-person]")).toHaveCount(4);
    await expect(page.getByTestId("home-partners")).toBeVisible();
    await expect(page.getByTestId("home-brief")).toBeVisible();

    await expect(page.getByTestId("home-gallery").getByRole("link", { name: /galeria/i }))
      .toHaveAttribute("href", "/galerie");
    await expect(page.getByTestId("home-packages").getByRole("link", { name: /pachete/i }))
      .toHaveAttribute("href", "/pachete");
    await expect(page.getByTestId("home-brief").getByRole("link", { name: /brief/i }))
      .toHaveAttribute("href", "/contact");
  });

  test("uses the approved editorial gallery and three-package runway", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const gallery = page.getByTestId("home-gallery");
    const packages = page.getByTestId("home-packages");

    await expect(gallery.locator("[data-gallery-item]")).toHaveCount(3);
    await expect(gallery.locator(".fa-work__meta span")).toHaveCount(0);
    await expect(gallery.locator(".fa-work__outro")).not.toContainText(/05|cadre/i);
    await expect(gallery.locator(".fa-work__intro")).toContainText(/Trei momente\.\s*O singură noapte\./);
    await expect(gallery.locator(".fa-work__outro")).toContainText("Spectacolul continuă.");
    await expect(gallery.locator(".fa-work__intro")).toHaveCSS("text-align", "center");
    await expect(gallery.locator(".fa-work__outro")).toHaveCSS("text-align", "center");
    await expect(gallery.locator(".fa-work__outro").getByRole("link")).toHaveAttribute("href", "/galerie");

    for (const frame of await gallery.locator("[data-gallery-item] figure").all()) {
      await expect(frame).toHaveCSS("border-radius", "0px");
    }

    await expect(packages.locator("[data-package-slab]")).toHaveCount(3);
    await expect(packages.locator("[data-package-transition-band]")).toHaveCount(0);
    await expect(packages.locator(".fa-packages__copy")).toHaveCount(0);
    await expect(packages.locator(".fa-package-slab > span")).toHaveCount(0);
    await expect(packages.locator(".fa-package-slab [data-package-type]")).toHaveText([
      "Artificii de noapte",
      "Show cu drone",
      "Drone + artificii",
    ]);

    const packageVideos = packages.locator("[data-package-youtube]");
    await expect(packageVideos).toHaveCount(3);
    for (const packageVideo of await packageVideos.all()) {
      await expect(packageVideo).toHaveAttribute("target", "_blank");
      await expect(packageVideo).toHaveAttribute("href", /youtube\.com|youtu\.be/);
      await expect(packageVideo.locator("[data-package-description]")).toBeAttached();
      await expect(packageVideo.locator("[data-package-detail]")).toBeAttached();
      await expect(packageVideo.getByText("Vezi clipul")).toBeAttached();
    }
  });

  test("shortens the gallery runway before the package handoff", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const galleryPinHeight = await page.getByTestId("home-gallery").locator(".fa-work__sticky").evaluate((node) => {
      const pinSpacer = node.parentElement;
      return pinSpacer?.classList.contains("pin-spacer") ? pinSpacer.getBoundingClientRect().height : 0;
    });

    expect(galleryPinHeight).toBeGreaterThan(2700);
    expect(galleryPinHeight).toBeLessThan(3100);
  });

  test("makes every homepage package a real video destination", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packageVideos = page.getByTestId("home-packages").locator("[data-package-youtube]");
    await expect(packageVideos).toHaveCount(3);
    await expect(packageVideos.nth(0)).toHaveAttribute("href", /youtube\.com|youtu\.be/);
    await expect(packageVideos.nth(0).getByText("Vezi clipul")).toBeAttached();
  });

  test("reveals positioned team copy on desktop hover without opening a dialog", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const team = page.getByTestId("home-team");
    const people = team.locator("[data-team-person]");
    const person = people.first();

    await expect(team.getByRole("heading", { level: 2 })).toHaveText("Oamenii din spatele luminii.");
    await expect(people).toHaveCount(4);
    const portraitSources = await team.locator("[data-team-cutout]").evaluateAll((images) => images.map((image) => image.getAttribute("src")));
    expect(new Set(portraitSources).size).toBe(4);
    expect(portraitSources.every((source) => source.includes("team-photo-person"))).toBe(true);
    await expect(team.locator(".fa-team__base")).toHaveCount(1);
    await expect(team.locator(".fa-team__base")).toHaveAttribute("src", /fireart-team-placeholder\.webp/);
    await expect(team.locator(".fa-team__spotlight")).toHaveCount(0);
    await expect(team.locator(".fa-team__person-label")).toHaveCount(0);
    await expect(team.locator("[data-team-copy]")).toHaveCount(1);
    await expect(people.nth(0)).toHaveAttribute("data-copy-side", "right");
    await expect(people.nth(1)).toHaveAttribute("data-copy-side", "right");
    await expect(people.nth(2)).toHaveAttribute("data-copy-side", "left");
    await expect(people.nth(3)).toHaveAttribute("data-copy-side", "left");

    await person.hover();
    expect(await team.getAttribute("data-active-person")).toBeNull();
    await expect(person).toHaveAttribute("data-active", "true");
    await expect(team).toHaveAttribute("data-active-person", "production");
    const copy = team.locator("[data-team-copy]");
    await expect(copy).toHaveAttribute("data-side", "right");
    await expect(copy.locator("[data-team-name]")).toBeVisible();
    await expect(copy.locator("[data-team-name]")).toHaveCSS("font-family", /Cormorant Garamond/);
    await expect(copy.locator("[data-team-role]")).toHaveText("Echipa FireArtRo");
    await expect(copy).not.toContainText(/\b0[1-4]\b/);
    await expect(copy.locator("p")).toContainText(/brief/i);
    const copyLines = copy.locator("[data-team-copy-line]");
    await expect(copyLines).toHaveCount(2);
    const typedCharacters = copy.locator("[data-team-typed-char]");
    expect(await typedCharacters.count()).toBeGreaterThan(20);
    const lineStartDelays = await copyLines.evaluateAll((lines) => lines.map((line) => {
      const firstCharacter = line.querySelector("[data-team-typed-char]");
      return firstCharacter ? getComputedStyle(firstCharacter).animationDelay : null;
    }));
    expect(lineStartDelays[0]).not.toBe(lineStartDelays[1]);
    const hitArea = await person.evaluate((node) => getComputedStyle(node).clipPath);
    expect(hitArea).toContain("polygon");

    const personBox = await person.boundingBox();
    await page.mouse.move(personBox.x + 2, personBox.y + 2);
    await expect(team).not.toHaveAttribute("data-active-person", /.+/);
    await page.waitForTimeout(350);
    await expect(copy).toHaveCSS("opacity", "0");

    await person.click();
    const dialog = page.getByRole("dialog", { name: /echipa/i });
    await expect(dialog).toBeHidden();
  });

  test("shows Facebook reviews without fabricating review content", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const reviews = page.getByTestId("facebook-reviews");
    await expect(reviews).toBeVisible();
    await expect(reviews.getByRole("link", { name: /Facebook/i })).toHaveAttribute(
      "href",
      /facebook\.com\/FireArtRo\/reviews/,
    );
    await expect(reviews.locator("[data-review-placeholder]")).toHaveCount(0);
  });

  for (const viewport of responsiveViewports) {
    test(`has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));

      expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
      await expect(page.getByTestId("hero-primary-cta")).toBeVisible();
    });
  }
});

# FireArt Full-Bleed Responsive Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver six genuinely full-bleed hero videos with safe baked typography and make the hero/gallery scale naturally from phones through 32:9 CSS viewports.

**Architecture:** Keep the existing React source-selection and playback lifecycle. Re-author the two existing HyperFrames masters so all imagery is full-bleed and all baked titles fit the crop-safe intersection, then derive six optimized delivery files with a deterministic FFmpeg cover/crop pipeline. Give only the cinematic hero/gallery a larger fluid stage; retain the ordinary readable-content cap everywhere else.

**Tech Stack:** React 19, CSS, GSAP/ScrollTrigger, Playwright, HyperFrames 0.8.19, FFmpeg/FFprobe, H.264 MP4, static WebP posters.

## Global Constraints

- Preserve the current 20-second loop, footage order, copy, colors, transitions, navigation, and page structure.
- Use CSS viewport dimensions and aspect ratio; do not branch on physical resolution or device name.
- Do not use blurred duplicate footage, letterboxing, `zoom`, or whole-application transforms.
- Preserve the current video recovery behavior for resize, rotation, visibility changes, and back-forward navigation.
- Keep wide and ultrawide MP4 files at or below 9 MB; keep the other MP4 files at or below 6 MB unless visual review shows obvious artifacts.
- Do not modify unrelated sections or routes.
- Do not use subagents.

---

### Task 1: Add full-bleed and large-viewport regression coverage

**Files:**
- Create: `frontend/e2e/night-runway-full-bleed.spec.js`
- Reference: `frontend/playwright.config.js`

**Interfaces:**
- Consumes: `.nr-hero`, `.hero-video-stage`, `.hero-media-surface`, `.fa-work__viewport`, and the existing `/` route.
- Produces: Playwright coverage that fails on the current blurred pseudo-layer and `90rem` gallery cap.

- [ ] **Step 1: Write the failing test**

```js
import { expect, test } from "@playwright/test";

test("hero is full-bleed and cinematic gallery scales on a 32:9 viewport", async ({ page }) => {
  await page.setViewportSize({ width: 5120, height: 1440 });
  await page.goto("/#acasa");

  const hero = page.locator(".nr-hero");
  const video = page.locator(".hero-media-surface");
  const stage = page.locator(".hero-video-stage");
  await expect(video).toBeVisible();

  const geometry = await page.evaluate(() => {
    const heroNode = document.querySelector(".nr-hero");
    const videoNode = document.querySelector(".hero-media-surface");
    const stageNode = document.querySelector(".hero-video-stage");
    const galleryNode = document.querySelector(".fa-work__viewport");
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
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
Set-Location frontend
npx playwright test e2e/night-runway-full-bleed.spec.js --project=desktop-chromium
```

Expected: FAIL because the stage pseudo-layer opacity is `0.58` and the gallery is only `1440px` wide.

- [ ] **Step 3: Commit the regression test**

```powershell
git add -- frontend/e2e/night-runway-full-bleed.spec.js
git commit -m "test: cover full-bleed ultrawide hero"
```

---

### Task 2: Re-author the landscape and portrait masters for safe full-bleed crops

**Files:**
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/index.html`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/styles.css`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/styles.css`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/frame.md`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/frame.md`

**Interfaces:**
- Consumes: existing HyperFrames scenes, timeline files, landscape assets, and portrait assets.
- Produces: a 3840×2160 landscape master safe for 4:3 through 32:9 cover crops and a 2160×3840 portrait master safe for 3:4 through tall-phone cover crops.

- [ ] **Step 1: Make every landscape photograph full-bleed**

Replace each landscape `<img class="photo photo-contain">` with centered full-bleed framing:

```html
<img class="photo photo-cover position-center" ... />
```

Keep existing `position-left-center` classes on fireworks scenes. Remove the unused `.photo-contain`, `.photo-backdrop`, and `.photo-foreground` rules after no scene references them.

- [ ] **Step 2: Constrain baked landscape titles to the common crop-safe intersection**

Add these landscape constraints while preserving existing timeline transforms:

```css
.title-card,
.card-depth-word {
  padding-inline: 480px;
  padding-left: 480px;
}

.card-title,
.run-word {
  max-width: 2880px;
  margin-inline: auto;
}
```

Reduce only title sizes that exceed `2880px` at their widest rendered state. Keep at least `480px` horizontal and `230px` vertical master-frame safety.

- [ ] **Step 3: Constrain portrait titles to the portrait crop-safe intersection**

Keep portrait imagery on `object-fit: cover`. Set the title-card safe band to the central `1770px` width and the vertical range `480px..3360px`:

```css
.title-card,
.card-depth-word {
  padding-inline: 195px;
  padding-bottom: clamp(480px, 12.5%, 520px);
}

.card-title,
.run-word {
  max-width: 1770px;
  margin-inline: auto;
}
```

Keep title baselines beneath the website's live mobile copy and above the bottom safe boundary.

- [ ] **Step 4: Record the framing rule in both frame specifications**

Add this exact rule to both `frame.md` files:

```markdown
- Every delivered aspect crop must be full-bleed. Keep primary formations and baked typography inside the shared crop-safe intersection; never use a blurred duplicate, contain frame, pillar, or letterbox.
```

- [ ] **Step 5: Update HyperFrames skills and validate both compositions**

Run:

```powershell
npx hyperframes skills update general-video
Set-Location tmp/fireart-drone-fireworks-trailer-20s-hf
npx --yes hyperframes@0.8.19 check . --strict
Set-Location ../fireart-drone-fireworks-trailer-20s-mobile-hf
npx --yes hyperframes@0.8.19 check . --strict
```

Expected: both checks exit `0` with no missing assets or timing assertion failures.

- [ ] **Step 6: Render the two loss-efficient 4K masters**

Run:

```powershell
Set-Location tmp/fireart-drone-fireworks-trailer-20s-hf
npx --yes hyperframes@0.8.19 render . --quality high --strict --no-browser-gpu --workers 4 -o "renders/fireart-full-bleed-landscape-4k.mp4"
Set-Location ../fireart-drone-fireworks-trailer-20s-mobile-hf
npx --yes hyperframes@0.8.19 render . --quality high --strict --no-browser-gpu --workers 4 -o "renders/fireart-full-bleed-portrait-4k.mp4"
```

Expected: two 20-second H.264 files at 3840×2160 and 2160×3840.

- [ ] **Step 7: Commit composition changes**

```powershell
git add -- tmp/fireart-drone-fireworks-trailer-20s-hf/index.html tmp/fireart-drone-fireworks-trailer-20s-hf/styles.css tmp/fireart-drone-fireworks-trailer-20s-hf/frame.md tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/styles.css tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/frame.md
git commit -m "fix: author full-bleed hero masters"
```

---

### Task 3: Add a deterministic six-variant export pipeline

**Files:**
- Create: `scripts/render-responsive-hero.ps1`
- Replace: `frontend/public/media/fireart-hero-wide.mp4`
- Replace: `frontend/public/media/fireart-hero-ultrawide.mp4`
- Replace: `frontend/public/media/fireart-hero-tablet-landscape.mp4`
- Replace: `frontend/public/media/fireart-hero-tablet-portrait.mp4`
- Replace: `frontend/public/media/fireart-hero-mobile.mp4`
- Replace: `frontend/public/media/fireart-hero-mobile-tall.mp4`
- Replace: matching six `.webp` posters.

**Interfaces:**
- Consumes: `-LandscapeMaster`, `-PortraitMaster`, and FFmpeg/FFprobe executables on `PATH`.
- Produces: the exact twelve public media paths already consumed by `HERO_MEDIA.variants`.

- [ ] **Step 1: Create the export script**

Implement a PowerShell variant table with these fields:

```powershell
$variants = @(
  @{ Name = 'wide'; Width = 1920; Height = 1200; Source = $LandscapeMaster; Crf = 25; MaxRate = '3600k' },
  @{ Name = 'ultrawide'; Width = 1920; Height = 900; Source = $LandscapeMaster; Crf = 25; MaxRate = '3400k' },
  @{ Name = 'tablet-landscape'; Width = 1440; Height = 1080; Source = $LandscapeMaster; Crf = 26; MaxRate = '2400k' },
  @{ Name = 'tablet-portrait'; Width = 1080; Height = 1440; Source = $PortraitMaster; Crf = 26; MaxRate = '2200k' },
  @{ Name = 'mobile'; Width = 900; Height = 1600; Source = $PortraitMaster; Crf = 26; MaxRate = '2200k' },
  @{ Name = 'mobile-tall'; Width = 900; Height = 1950; Source = $PortraitMaster; Crf = 27; MaxRate = '2200k' }
)
```

For each MP4, use this filter and delivery contract:

```text
scale=W:H:force_original_aspect_ratio=increase:flags=lanczos,crop=W:H
-c:v libx264 -preset slow -crf CRF -maxrate MAXRATE -bufsize 2*MAXRATE -pix_fmt yuv420p -r 30 -an -movflags +faststart
```

Extract the matching poster at `0.70s` from the finished MP4 with `-frames:v 1 -c:v libwebp -quality 82`.

- [ ] **Step 2: Validate all generated media inside the script**

After each export, call FFprobe and fail with a non-zero exit if width, height, duration `19.9..20.1`, codec `h264`, or frame rate `30/1` differs from the table. Fail if wide/ultrawide exceeds `9MB` or another MP4 exceeds `6MB`.

- [ ] **Step 3: Run the export script**

Run:

```powershell
./scripts/render-responsive-hero.ps1 `
  -LandscapeMaster "tmp/fireart-drone-fireworks-trailer-20s-hf/renders/fireart-full-bleed-landscape-4k.mp4" `
  -PortraitMaster "tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/renders/fireart-full-bleed-portrait-4k.mp4"
```

Expected: twelve validated files under `frontend/public/media` and no temporary intermediates left behind.

- [ ] **Step 4: Commit the pipeline and media**

```powershell
git add -- scripts/render-responsive-hero.ps1 frontend/public/media/fireart-hero-*.mp4 frontend/public/media/fireart-hero-*.webp
git commit -m "fix: deliver full-bleed responsive hero media"
```

---

### Task 4: Remove the blurred web backdrop and scale the cinematic stages fluidly

**Files:**
- Modify: `frontend/src/styles/night-home.css`
- Modify: `frontend/src/styles/night-home-film.css`
- Modify: `frontend/src/data/content.js`
- Test: `frontend/e2e/night-runway-full-bleed.spec.js`

**Interfaces:**
- Consumes: the existing hero classes and the six unchanged media paths.
- Produces: no active blurred pseudo-layer, fluid large-screen hero typography, and a gallery width in `90rem..160rem`.

- [ ] **Step 1: Disable the blurred poster pseudo-layer**

Replace the `.hero-video-stage::before` visual treatment with:

```css
.hero-video-stage::before {
  content: none;
  opacity: 0;
}
```

Keep `.hero-media-surface` at absolute inset `0`, width/height `100%`, `object-fit: cover`, and `object-position: center`.

- [ ] **Step 2: Add a dedicated cinematic width token**

Add to `.fa-home`:

```css
--nr-cinematic-max: clamp(90rem, 72vw, 160rem);
```

Change `.fa-work__viewport` to:

```css
width: min(100%, var(--nr-cinematic-max));
```

Do not change `.nr-shell` or `--nr-max`.

- [ ] **Step 3: Raise only cinematic large-screen typography and image caps**

Use bounded fluid sizing:

```css
.fa-work__intro h2,
.fa-work__outro h3 {
  font-size: clamp(3rem, 3.4vmin, 7.25rem);
}

.fa-work__card figure {
  height: min(68dvh, clamp(39rem, 36vw, 61rem));
}

.fa-work__meta h3 {
  font-size: clamp(1.35rem, 1.45vmin, 3rem);
}
```

Keep the existing compact/coarse-pointer overrides unchanged.

- [ ] **Step 4: Update the media cache key**

Change all six hero media query suffixes in `frontend/src/data/content.js` from `v=20260901-premium` to `v=20260902-full-bleed`.

- [ ] **Step 5: Run the regression test to verify GREEN**

Run:

```powershell
Set-Location frontend
npx playwright test e2e/night-runway-full-bleed.spec.js --project=desktop-chromium
```

Expected: PASS with zero failed tests.

- [ ] **Step 6: Commit responsive delivery changes**

```powershell
git add -- frontend/src/styles/night-home.css frontend/src/styles/night-home-film.css frontend/src/data/content.js frontend/e2e/night-runway-full-bleed.spec.js
git commit -m "fix: scale cinematic home stages fluidly"
```

---

### Task 5: Verify media, lifecycle, transition, and viewport matrix

**Files:**
- Test: `frontend/e2e/night-runway-full-bleed.spec.js`
- Test: existing `frontend/e2e/night-runway-hero-lifecycle.spec.js`
- Test: existing `frontend/e2e/night-runway-global.spec.js`
- Test: existing `frontend/e2e/night-runway-home.spec.js`
- Test: existing `frontend/e2e/night-runway-home-refactor.spec.js`

**Interfaces:**
- Consumes: complete implementation from Tasks 1–4.
- Produces: fresh build, browser, media-metadata, and visual evidence suitable for commit/push.

- [ ] **Step 1: Run focused browser tests**

Run:

```powershell
Set-Location frontend
npx playwright test `
  e2e/night-runway-full-bleed.spec.js `
  e2e/night-runway-hero-lifecycle.spec.js `
  e2e/night-runway-global.spec.js `
  e2e/night-runway-home.spec.js `
  e2e/night-runway-home-refactor.spec.js `
  --project=desktop-chromium
```

Expected: zero failures.

- [ ] **Step 2: Run the production build**

Run:

```powershell
Set-Location frontend
npm run build
```

Expected: exit `0` with a production build under `frontend/build`.

- [ ] **Step 3: Run the browser matrix**

Capture hero and gallery screenshots at `375×812`, `430×932`, `768×1024`, `1024×768`, `1366×768`, `1440×900`, `1512×982`, `1920×1080`, `2560×1440`, `3440×1440`, `3840×2160`, and `5120×1440`. At each size assert no page-level horizontal overflow and inspect the selected video source, full hero coverage, complete baked titles, gallery scale, and hero-to-gallery handoff.

- [ ] **Step 4: Inspect representative media frames**

Extract frames at `0.7`, `3.2`, `6.8`, `10.4`, `16.9`, and `19.2` seconds from all six MP4s into a uniquely named directory under `%TEMP%`. Inspect the outer 15% of each frame, title completeness, formation completeness, and compression. Delete each file and then the verified temporary directory.

- [ ] **Step 5: Verify Git scope and push the final branch state to main**

Run:

```powershell
git status --short
git diff --check HEAD~4..HEAD
git log --oneline -6
git push origin HEAD:main
```

Expected: only the approved hero/gallery files and documentation are committed; push succeeds without force.

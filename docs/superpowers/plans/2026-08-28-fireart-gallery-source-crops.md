# FireArtRo Gallery Source Crops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the twelve damaged portrait assets from intact source photographs, keep their natural composition, and prevent stale cached versions from appearing in the gallery.

**Architecture:** A focused Python content-pipeline script owns the source-to-public mapping, crop rectangles, WebP encoding, manifest dimensions, and URL revision. A standard-library unittest validates cropping and resizing with synthetic images before the real media is touched. Existing React lightbox geometry remains unchanged because it already follows decoded natural dimensions.

**Tech Stack:** Python 3.11, Pillow, JSON, React 19, Playwright 1.62, CRACO.

## Global Constraints

- Rebuild affected images from originals, never from already-cropped public WebPs.
- Remove only confirmed black/device-interface margins.
- Preserve full photograph width and natural portrait composition.
- Keep SEO-oriented WebP filenames and WebP output.
- Update catalog dimensions and add a URL revision for changed media.
- Preserve natural-ratio lightbox previews and viewport-anchored controls.

---

### Task 1: Deterministic portrait rebuild pipeline

**Files:**
- Create: `frontend/scripts/rebuild-gallery-portrait-assets.py`
- Create: `frontend/scripts/tests/test_rebuild_gallery_portraits.py`

**Interfaces:**
- Consumes: raw images in `tmp/source-media-20260801` and `frontend/src/data/importedGalleryItems.json`.
- Produces: `rebuild_assets(project_root: Path) -> list[dict]`, corrected WebPs, updated manifest metadata, and revision `source-crop-20260828`.

- [ ] **Step 1: Write a failing synthetic-image unittest**

Create a test that imports the rebuild module, feeds a `1179×2556` synthetic screenshot with black bars at `y=0..229` and `y=2326..2555`, and asserts the processed image retains all 1179 source columns, crops to `1179×2096`, and resizes to `1080×1920`.

- [ ] **Step 2: Run the targeted unittest and verify it fails**

Run: `python -m unittest scripts.tests.test_rebuild_gallery_portraits -v`

Expected: import failure because `rebuild-gallery-portrait-assets.py` does not exist yet.

- [ ] **Step 3: Implement source mappings and processing helpers**

Define exact mappings for gallery sequences `002`, `003`, `010`, `011`, `012`, `013`, `014`, `015`, `088`, `090`, `104`, and `134`. Use full-width crops `(0, 230, 1179, 2326)` for the eight `image-set` screenshots, trim the 12-row black header only from `into-it/image00084.jpeg` and `image00100.jpeg`, and leave `image00086.jpeg` and `image00132.jpeg` uncropped. Apply EXIF transpose, RGB conversion, max-edge resizing to 1920 px, and WebP quality 86/method 6.

- [ ] **Step 4: Implement manifest updates and revision URLs**

For every mapped filename, update `width`, `height`, and rounded `aspectRatio`; set `thumbnail`, `poster`, and `src` to the same SEO filename plus `?v=source-crop-20260828`. Reject missing or duplicate catalog matches.

- [ ] **Step 5: Run the unittest and verify it passes**

Run: `python -m unittest scripts.tests.test_rebuild_gallery_portraits -v`

Expected: all crop, resize, and URL-revision assertions pass.

### Task 2: Rebuild and inspect the real assets

**Files:**
- Modify: `frontend/public/media/gallery/*.webp` for the twelve mapped files
- Modify: `frontend/src/data/importedGalleryItems.json`

**Interfaces:**
- Consumes: `rebuild_assets(project_root)` from Task 1.
- Produces: twelve corrected assets whose manifest ratio equals their decoded natural ratio.

- [ ] **Step 1: Run the rebuild script**

Run: `python scripts/rebuild-gallery-portrait-assets.py --project-root ..`

Expected: twelve destination files rebuilt and twelve unique manifest entries updated.

- [ ] **Step 2: Verify image format and dimensions**

Run the script with `--check` and require twelve WebP files, eight `1080×1920` screenshot-derived outputs, intact standard portraits, matching catalog dimensions, and revisioned URLs.

- [ ] **Step 3: Generate and inspect a contact sheet**

Generate a diagnostic contact sheet from the twelve public outputs. Check that every image keeps full width, no black/device bars remain, and key fireworks, venue, and audience content are present.

### Task 3: Browser regression coverage

**Files:**
- Modify: `frontend/e2e/night-runway-gallery.spec.js`

**Interfaces:**
- Consumes: revisioned gallery URLs and natural dimensions from Task 2.
- Produces: a browser assertion that decoded ratio, frame ratio, and rendered ratio agree for the formerly narrow image.

- [ ] **Step 1: Add a failing regression assertion for `gallery-import-002`**

Open the item and assert `naturalWidth / naturalHeight` is approximately `0.5625`, the frame ratio differs by less than `0.01`, and the rendered width is at least 450 px at `1854×905`.

- [ ] **Step 2: Run the Chromium gallery test**

Run: `npx playwright test e2e/night-runway-gallery.spec.js --project=chromium`

Expected: regression assertion passes against the rebuilt asset and fixed controls.

- [ ] **Step 3: Run desktop and mobile browser coverage**

Run: `npx playwright test e2e/night-runway-gallery.spec.js`

Expected: all configured Chromium, Firefox, WebKit, Edge, Opera, phone, and tablet projects pass.

### Task 4: Production verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: corrected assets, catalog, and gallery regression coverage.
- Produces: production build and final evidence.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 2: Serve the build and verify cache-busted media**

Request the revisioned image URL and confirm it decodes to `1080×1920`; open it in a fresh Playwright context and capture desktop/mobile screenshots.

- [ ] **Step 3: Review the scoped diff**

Run: `git diff --check` and inspect only the pipeline, tests, catalog, and twelve binary assets before reporting completion.

# FireArt Faithful Editorial Opener Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native-4K, nine-second FireArt drone-photo loop whose beat structure and typographic motion closely follow the supplied Envato Stylish Opener preview.

**Architecture:** Create a new isolated HyperFrames project so the rejected render and its source remain available. Keep structure, styling, and the seek-safe GSAP timeline in separate files; reuse full-resolution source photographs and render one image per 0.5-second module. Validate the HTML composition before producing a 270-frame 4K H.264 master.

**Tech Stack:** HyperFrames 0.8.17, HTML/CSS, GSAP 3.14.2, FFmpeg/ffprobe, PowerShell

## Global Constraints

- Duration is exactly 9.0 seconds at 30 fps: 270 frames.
- Canvas is native 4K UHD: 3840 x 2160.
- Use only FireArt photographs and original FireArt copy.
- Use one photograph per frame; no mosaic or multi-image grid.
- Keep complete drone formations visible in each resolved photographic beat.
- Do not display `0/16`, frame counters, sequence numbers, locations, technical metadata, or upper-corner captions.
- Do not use cross-dissolves, slow Ken Burns motion, floating cards, rounded corners, blurred backdrops, or permanent glitch.
- Keep the prior project and all rejected outputs unchanged.

---

## File Map

- Create `tmp/drone-faithful-editorial-4k-hf/index.html`: semantic composition shell and eighteen scene modules.
- Create `tmp/drone-faithful-editorial-4k-hf/styles.css`: 4K layout, typography, image windows, tonal treatments, and transition layers.
- Create `tmp/drone-faithful-editorial-4k-hf/timeline.js`: deterministic GSAP timeline with 0.5-second beat boundaries.
- Create `tmp/drone-faithful-editorial-4k-hf/index.motion.json`: machine-checkable timing and motion assertions.
- Create `tmp/drone-faithful-editorial-4k-hf/frame.md`: palette, typography, framing, and forbidden-element contract.
- Create `tmp/drone-faithful-editorial-4k-hf/assets/stills/*`: full-resolution FireArt photographs copied from the extracted archive.
- Create `tmp/drone-faithful-editorial-4k-hf/assets/fonts/*`: embedded display font used by the composition.
- Create `output/drone-faithful-editorial-opener-4k.mp4`: final high-quality master.
- Create `output/drone-faithful-editorial-opener-4k-contact-sheet.jpg`: inspected proof sheet.
- Create `output/drone-faithful-editorial-opener-4k-loop-seam.jpg`: first/final-frame proof.

### Task 1: Isolate the 4K project and full-resolution assets

**Files:**
- Create: `tmp/drone-faithful-editorial-4k-hf/hyperframes.json`
- Create: `tmp/drone-faithful-editorial-4k-hf/package.json`
- Create: `tmp/drone-faithful-editorial-4k-hf/meta.json`
- Create: `tmp/drone-faithful-editorial-4k-hf/frame.md`
- Create: `tmp/drone-faithful-editorial-4k-hf/assets/stills/*`
- Create: `tmp/drone-faithful-editorial-4k-hf/assets/fonts/*`

**Interfaces:**
- Consumes: extracted photographs under `tmp/poze-inspect-2026-08-28/Poze` and embedded fonts from the prior HyperFrames project.
- Produces: stable relative asset URLs under `assets/stills/` and `assets/fonts/` for the composition.

- [ ] **Step 1: Probe the current HyperFrames pin**

Run from the prior project:

```powershell
npx hyperframes@latest upgrade --project . --check --json
```

Expected: project pin and latest version both report `0.8.17`.

- [ ] **Step 2: Create the isolated project scaffold**

Run:

```powershell
npx hyperframes init "tmp/drone-faithful-editorial-4k-hf" --non-interactive --example=blank --skill=motion-graphics
```

Expected: `hyperframes.json`, `package.json`, and `meta.json` exist only in the new directory.

- [ ] **Step 3: Copy full-resolution source photographs with stable names**

Copy the approved high-resolution files and avoid the low-resolution Baia Mare 2 and Untold exports. Use these destination names:

```text
adam-7638.jpg       <- ADAM SHOW/IMG_7638 3.jpg
adam-7640.jpg       <- ADAM SHOW/IMG_7640.jpg
baia-5485.jpg       <- BAIA MARE/IMG_5485 2.JPG
baia-5524.jpg       <- BAIA MARE/IMG_5524 2.JPG
baia-5525.jpg       <- BAIA MARE/IMG_5525 2.JPG
baia-5527.jpg       <- BAIA MARE/IMG_5527 2.JPG
baia-5528.jpg       <- BAIA MARE/IMG_5528 2.JPG
focsani-0768.jpg    <- focsani/DJI_0768-Enhanced-NR.JPG
ior-9985.jpg        <- REVELION IOR/IMG_9985 3.JPG
mastercard-5098.jpg <- MASTERCARD/IMG_5098.JPG
mastercard-5104.jpg <- MASTERCARD/IMG_5104.JPG
militari-1775.jpg   <- MILITARI SHOPPING/IMG_1775.JPG
militari-1776.jpg   <- MILITARI SHOPPING/IMG_1776.JPG
```

Expected: thirteen readable JPEG files; hero files are at least 3500 px wide except `ior-9985.jpg`, which is reserved for a contained band.

- [ ] **Step 4: Copy the embedded heavy display font and write `frame.md`**

Use the existing local Bricolage Grotesque 800 font as the deterministic heavy grotesk. `frame.md` must declare 3840 x 2160, near-black/warm-white/acid-yellow/cyan/red colors, single-image framing, and the no-counter rule.

- [ ] **Step 5: Validate the asset inventory**

Run a PowerShell `System.Drawing.Image` dimension probe over every copied JPEG.

Expected: thirteen successful opens, no zero-byte files, and recorded dimensions for every asset.

### Task 2: Build the eighteen-beat 4K editorial composition

**Files:**
- Create: `tmp/drone-faithful-editorial-4k-hf/index.html`
- Create: `tmp/drone-faithful-editorial-4k-hf/styles.css`
- Create: `tmp/drone-faithful-editorial-4k-hf/index.motion.json`

**Interfaces:**
- Consumes: relative image URLs and the display font from Task 1.
- Produces: stable untimed scene selectors `#beat-01` through `#beat-18`, plus word selectors used by the timeline and checker.

- [ ] **Step 1: Write a failing motion contract**

Create `index.motion.json` with duration `9`, `maxStaticSec` `0.5`, an `appearsBy` assertion for `#word-fireart-open` by `0.8`, `#word-formation` by `3.0`, `#word-in-motion` by `5.8`, and `#word-shows-final` by `8.9`, plus a `keepsMoving` assertion for `#fireart-editorial-opener`.

- [ ] **Step 2: Run the checker before the composition exists**

Run:

```powershell
npx hyperframes check . --json
```

Expected: failure because `index.html` and the asserted selectors do not exist yet.

- [ ] **Step 3: Author the semantic beat structure**

Create one root composition with `data-composition-id="fireart-editorial-opener"`, `data-width="3840"`, `data-height="2160"`, `data-duration="9"`, and exactly eighteen absolute untimed scene elements. The first scene is visible in CSS and scenes 2-18 start at opacity zero; the single GSAP timeline owns all 0.5-second boundaries so two-to-three-frame overlaps remain possible without fighting clip lifecycle.

- [ ] **Step 4: Implement the reference-faithful visual systems**

In `styles.css`, implement high-key exposure, near-black cards, full-color contain framing, monochrome framing, cyan duotone, wide image windows, filled/outline typography, repeated word rows, horizontal letter slices, and two reusable RGB ghost layers. All dimensions and type sizes are authored for 3840 x 2160.

- [ ] **Step 5: Enforce the no-metadata contract**

Run:

```powershell
rg -n "0/16|frame-index|location|BAIA|FOCȘANI|UNTOLD|metadata|counter" index.html styles.css
```

Expected: no matches.

### Task 3: Implement the seek-safe beat timeline and seamless loop

**Files:**
- Create: `tmp/drone-faithful-editorial-4k-hf/timeline.js`
- Modify: `tmp/drone-faithful-editorial-4k-hf/index.html`

**Interfaces:**
- Consumes: scene and word selectors from Task 2.
- Produces: `window.__timelines['fireart-editorial-opener']`, paused at zero and seekable for deterministic rendering.

- [ ] **Step 1: Initialize the GSAP timeline deterministically**

Create one paused timeline with `defaults: { ease: 'none' }`, hide all scenes, show the first scene, register it in `window.__timelines`, and call `tl.seek(0)` after construction.

- [ ] **Step 2: Animate beats 1-6**

Implement scattered-letter assembly, a hard photo/title lock, the warm-white split-fill `DRONES` card, the black `IN` card, acid-yellow `FORMATION`, and repeated `FORMATION` rows. Keep every internal transition between three and eight frames.

- [ ] **Step 3: Animate beats 7-12**

Implement filled-to-outline `NIGHT`, band expansion/contraction, a three-frame RGB interruption, and fragmented-to-stable `IN MOTION` over a monochrome formation.

- [ ] **Step 4: Animate beats 13-18**

Implement the directional `DRONE` hero, cyan/black split-fill `SHOWS`, cyan-duotone `BY FIREART`, vertical-mask `FIREART`, rotational blur-to-sharp `DRONE`, and final warm-white `SHOWS` with outline echoes.

- [ ] **Step 5: Close the loop numerically**

Set the first and final frame to the same warm-white exposure state. The last type elements clear before frame 269 so frame 269 and frame 0 share the same luminance and color field.

### Task 4: Validate and visually tune the composition

**Files:**
- Modify if needed: `tmp/drone-faithful-editorial-4k-hf/index.html`
- Modify if needed: `tmp/drone-faithful-editorial-4k-hf/styles.css`
- Modify if needed: `tmp/drone-faithful-editorial-4k-hf/timeline.js`
- Create: `tmp/drone-faithful-editorial-4k-hf/snapshots/*`

**Interfaces:**
- Consumes: complete composition from Tasks 2-3.
- Produces: passing automated checks and inspected proof frames.

- [ ] **Step 1: Run static and runtime checks**

Run:

```powershell
npx hyperframes lint . --json
npx hyperframes check . --samples 24 --at-transitions --json
```

Expected: zero runtime, layout, motion, and contrast errors; no file-size warning because CSS and timeline logic are split from the HTML.

- [ ] **Step 2: Capture proof frames**

Capture at `0.2,0.8,1.3,1.8,2.3,2.8,3.3,3.8,4.3,4.8,5.3,5.8,6.3,6.8,7.3,7.8,8.3,8.8` seconds.

Expected: eighteen visually distinct states, one photo per photographic beat, no counters, and no cropped hero formation.

- [ ] **Step 3: Inspect the contact sheet against the reference**

Check for the same cadence of white/photo/white/black/photo, typography-led variation every half-second, restrained RGB punctuation, wide photo windows, and a clean high-key loop seam. Repair any beat that reads as a repeated slideshow layout.

- [ ] **Step 4: Re-run every failed gate after repairs**

Expected: all checks pass on the final source before rendering.

### Task 5: Render and verify the native-4K master

**Files:**
- Create: `output/drone-faithful-editorial-opener-4k.mp4`
- Create: `output/drone-faithful-editorial-opener-4k-contact-sheet.jpg`
- Create: `output/drone-faithful-editorial-opener-4k-loop-seam.jpg`

**Interfaces:**
- Consumes: validated HyperFrames composition.
- Produces: final user-facing 4K H.264 master and visual QA artifacts.

- [ ] **Step 1: Render with software browser capture**

Run from the composition directory:

```powershell
npx hyperframes render . --quality high --strict --no-browser-gpu --workers 4 -o "..\..\output\drone-faithful-editorial-opener-4k.mp4"
```

Expected: all 270 frames render and encode without the hardware-GPU capture deadlock seen in the prior project.

- [ ] **Step 2: Verify stream metadata**

Run `ffprobe` for codec, profile, width, height, pixel format, frame rate, frame count, duration, size, and bitrate.

Expected: H.264 High, 3840 x 2160, yuv420p, 30/1 fps, 270 frames, and 9.000000 seconds.

- [ ] **Step 3: Decode the entire output**

Run:

```powershell
ffmpeg -v error -i "output\drone-faithful-editorial-opener-4k.mp4" -f null NUL
```

Expected: exit code 0 and no output.

- [ ] **Step 4: Generate and inspect QA sheets**

Generate a dense contact sheet across all nine seconds and a two-frame first/final seam comparison. Inspect both at original detail.

- [ ] **Step 5: Verify the loop seam numerically**

Blend frame 0 against frame 269 in difference mode and print `signalstats`.

Expected: zero or near-zero average luminance difference and no visible flash beyond the intentional shared exposure frame.

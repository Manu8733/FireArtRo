# FireArt Drone Stylish Opener

## Scope

Create a silent 9-second website hero loop from the supplied FireArt drone-show photographs. The result must feel like a kinetic editorial opener, not a slideshow. It will borrow the motion language of the approved Envato reference without reproducing its layout, copy, or sequence.

Target output: 1920x1080, 30 fps, H.264, `yuv420p`, fast-start MP4.

## Visual Identity

- Use near-black `#050505` and warm white `#F4F4F0` as the dominant graphic field.
- Use one electric cyan accent sampled from the drone photographs; reserve red/cyan separation for transition frames only.
- Use `Bricolage Grotesque` for large kinetic words and `IBM Plex Mono` for small location labels.
- Photographs remain full-bleed. Do not use cards, mosaics, blurred backdrops, rounded frames, or persistent borders.
- Texture is limited to subtle film grain and restrained optical bloom around existing drone lights.

## Copy

The typography acts as graphic rhythm rather than advertising copy. Use only:

- `DRONES`
- `IN FORMATION`
- `NIGHT`
- `IN MOTION`
- `FIREART`
- `DRONE SHOWS`

Real location labels may appear briefly in small type when the matching photograph is shown, including `BAIA MARE`, `FOCȘANI`, `MASSIF`, and `UNTOLD`. Do not add slogans, inspirational sentences, invented claims, metrics, or client names.

## Storyboard

1. **0.00-0.45 — Signal:** Near-black opening. `FIREART` assembles from cropped letter fragments over a brief warm-white exposure pulse.
2. **0.45-1.10 — Subject:** A strong landscape formation fills the frame. Oversized `DRONES` enters through a horizontal clip reveal.
3. **1.10-1.55 — Structure:** Warm-white intertitle with `IN FORMATION`, interrupted by a narrow photographic slit.
4. **1.55-3.00 — First acceleration:** Four full-screen photographs arrive in 0.30-0.40 second beats using alternating horizontal and vertical split wipes. Small real location labels appear on two shots.
5. **3.00-3.45 — Reset:** Hard near-black field. `NIGHT` lands large and centered, then is displaced by the next image.
6. **3.45-4.25 — Motion statement:** A hero photograph fills the frame while repeated outline typography resolves into `IN MOTION`.
7. **4.25-6.80 — Peak:** Seven distinct full-screen photographs run in an accelerating sequence. Use short directional pushes, match-position cuts between drone formations, and red/cyan separation only during the cut frames.
8. **6.80-7.35 — Brand impact:** A warm-white exposure frame collapses to `FIREART` on near-black.
9. **7.35-8.60 — Hero hold:** The strongest wide photograph holds long enough to read. `DRONE SHOWS` enters with a clean clip reveal.
10. **8.60-9.00 — Loop handoff:** Typography and image close through a narrow shutter into the same near-black field used at frame zero.

## Photograph Selection and Framing

- Use 14-16 landscape photographs from distinct show folders.
- Select images close to 16:9 so full-bleed presentation requires only minimal cropping.
- Manually define a focal point for every photograph. The complete drone formation must remain visible in all hero frames.
- Do not repeat near-identical formations or use fireworks-dominant photographs in this drone loop.
- Do not use portrait photographs, letterboxing, or a generated background to fill the frame.

## Motion Rules

- Every photograph must already be moving when it becomes visible; no static incoming frame followed by delayed motion.
- Per-shot scale range stays between 1.04 and 1.10, with directional translation coordinated with the transition.
- Transitions last 4-8 frames. Prefer split wipes, clip reveals, directional pushes, and one-frame exposure punctuation.
- Do not use cross-dissolves, slow Ken Burns pans, floating cards, random shake, permanent chromatic aberration, or decorative particles.
- Oversized type may crop intentionally at frame edges, but the key word must remain readable at its hero moment.

## Loop and Website Behavior

- The first and final frames share the same near-black field so the browser loop does not flash.
- The sequence must communicate rhythm without audio because the website hero autoplays muted.
- Keep the visual center sufficiently clear for the existing homepage text overlay when the clip is placed behind the hero content.

## Verification

- Confirm exact 9.0-second duration, 1920x1080 resolution, 30 fps, H.264 codec, `yuv420p`, and fast-start metadata.
- Decode the entire MP4 with FFmpeg and require zero errors.
- Review a dense contact sheet covering entrances, hero moments, and transitions.
- Inspect every selected photograph at its most cropped frame and confirm the complete drone formation remains visible.
- Play the final two loops consecutively and confirm there is no visible flash, frozen frame, or timing hitch at the seam.

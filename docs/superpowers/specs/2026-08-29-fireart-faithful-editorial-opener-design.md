# FireArt Faithful Editorial Opener

## Goal

Rebuild the nine-second FireArt drone-photo loop so its visual grammar closely follows the supplied Envato "Stylish Opener" preview while using only FireArt photography and original FireArt copy. The result must feel like the same class of template rather than a generic photo montage.

## Fixed Output

- Duration: exactly 9.0 seconds
- Canvas: 3840 x 2160 (native 4K UHD)
- Frame rate: 30 fps
- Delivery: high-quality 4K H.264 master suitable for the user's later animated-WebP conversion
- Loop: the final exposure frame must connect cleanly to the opening exposure frame
- Audio: none; the website will autoplay the loop muted

## Visual Grammar

- Build the timeline from eighteen 0.5-second editorial modules.
- Alternate among high-key warm white, near-black, full-color photography, monochrome photography, and one cyan-duotone passage.
- Use one photograph at a time. A photograph may sit in one wide cinematic window, but there must be no mosaic or multi-image grid.
- Keep each important drone formation complete inside its image area. Reveals may temporarily mask the frame, but the resolved beat must not crop through the formation.
- Typography drives every beat: scattered letters resolve, fill changes to outline, words repeat vertically, masks slice through letters, and short RGB offsets punctuate transitions.
- Change either image, type treatment, framing, or tonal treatment every 0.5 seconds. No repeated static hero treatment.
- Small non-text geometric marks are permitted only where they mirror the restrained editorial details in the reference.
- Do not display frame counters, sequence numbers, location labels, technical metadata, or upper-corner captions.

## Copy

Use only these original FireArt terms:

- `FIREART`
- `DRONES`
- `IN`
- `FORMATION`
- `NIGHT`
- `IN MOTION`
- `DRONE`
- `SHOWS`
- `BY FIREART`

Do not use location labels, technical metadata, frame counters such as `0/16`, slogans, claims, or filler copy.

## Beat Map

| Time | Visual and motion |
| --- | --- |
| 0.0-0.5 | Warm-white overexposed drone photograph. Separated `FIREART` letters enter from different horizontal positions. |
| 0.5-1.0 | Letters lock into `FIREART`; the washed photograph becomes slightly more legible before a hard cut. |
| 1.0-1.5 | Full-width hero photograph with oversized filled `DRONES`; horizontal split reveal and hard focus lock. |
| 1.5-2.0 | Warm-white `DRONES` impact card; black type contains a restrained red/photo-texture split. |
| 2.0-2.5 | Near-black `IN` card with two or three minimal editorial marks. |
| 2.5-3.0 | Dark isolated formation photograph with acid-yellow `FORMATION`. |
| 3.0-3.5 | Repeated stacked `FORMATION` echoes collapse into one sharp central word. |
| 3.5-4.0 | Dark photograph in a cinematic band with filled `NIGHT`. |
| 4.0-4.5 | A second photograph in a wide window; `NIGHT` changes from outline to fill through a masked wipe. |
| 4.5-5.0 | The band expands and contracts while one complete formation remains visible; outline `NIGHT` resolves. |
| 5.0-5.5 | Monochrome photograph enters with a two-to-three-frame RGB split; fragmented `IN MOTION` assembles. |
| 5.5-6.0 | The monochrome frame stabilizes and `IN MOTION` locks cleanly. |
| 6.0-6.5 | Full-color hero photograph with oversized `DRONE`; directional text/image offset settles. |
| 6.5-7.0 | Warm-white `SHOWS` card with cyan-and-black split fill inside the word. |
| 7.0-7.5 | Cyan-duotone photograph with `BY FIREART`, using the reference's bold centered editorial composition. |
| 7.5-8.0 | Full-color photograph with `FIREART`; a narrow vertical mask reveals the word and image together. |
| 8.0-8.5 | Near-black `DRONE` card; blurred rotational type snaps into focus. |
| 8.5-9.0 | Warm-white `SHOWS` card with oversized outline echoes at the edges; the last frame returns to the opening exposure state. |

## Typography and Color

- Display type: embedded heavy grotesk, uppercase, close to the reference's compact bold sans serif
- Body/metadata: none
- Near-black: `#08090A`
- Warm white: `#F3F0E8`
- Acid yellow: `#E8FF00`
- Cyan: `#20E0D0`
- RGB transition red: `#E31B35`
- Avoid the permanent teal guide lines, upper-corner counters, sequence numbers, and small location labels from the rejected version

## Motion Constraints

- Primary module duration: 15 frames
- Internal type moves: 3-8 frames, then a hard hold
- RGB split: maximum 3 frames per occurrence
- No cross-dissolves, slow Ken Burns moves, floating cards, rounded corners, blurred backdrops, or continuous glitch
- Use hard cuts, masked wipes, split reveals, frame expansion, and typographic displacement
- All animation must remain deterministic and seek-safe in HyperFrames

## Verification

- Inspect proof frames at the start, midpoint, every major tonal switch, and the loop seam.
- Run HyperFrames lint, runtime/layout/motion/contrast checks, and transition sampling.
- Decode the entire 4K master with FFmpeg.
- Verify 270 frames, 9.0-second duration, 3840 x 2160 dimensions, and 30 fps.
- Compare first and final frames numerically to confirm a clean loop.

## Explicit Non-Goals

- Do not copy or reuse any media asset from the Envato preview.
- Do not duplicate its product wording or logos.
- Do not introduce mosaics or crop important drone formations.
- Do not preserve the rejected opener's location labels, long hero holds, or repeated layout.

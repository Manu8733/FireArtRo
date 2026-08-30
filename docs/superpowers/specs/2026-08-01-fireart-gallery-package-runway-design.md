# FireArt Gallery And Package Runway Design

## Goal

Replace the current five-card gallery and five-slab package sequence with one continuous, dark editorial runway: three gallery works rise into view while travelling left, an editorial end panel closes the gallery, and three real package formats dock into a single composition.

## Approved Direction

- Keep the existing hero unchanged.
- Use the Trionn work-section motion principle as reference, without copying its markup or styling.
- Gallery order: intro panel, three work cards, final editorial panel.
- Remove all visible numeric indices from gallery and package cards.
- Gallery images use exact 90-degree corners and no decorative border.
- Gallery copy is concise: `Noaptea, vazuta de aproape.` and `Restul se vede in galerie.`
- The homepage selection keeps the three core visual formats: drone, fireworks, and hybrid.
- Package selection is reduced to the three core existing offers: `Night Signature`, `Drone Story`, and `Hybrid`.
- Remove the standalone package heading `Cinci puncte de plecare. Nicio formula rigida.`
- Package cards rise from below and dock one after another into a three-panel composition. They do not arrive as five independent slabs and do not use transition bands.
- The end of the gallery and start of the package sequence share the same blue-black background so the transition reads as one scene.

## Motion

On desktop, the gallery is pinned. The horizontal track moves left linearly while each incoming card inner wrapper moves from roughly 55-60vh below its final position to zero using a cubic ease based on its horizontal position. This reproduces the observed bottom-up plus leftward overlap from Trionn while keeping FireArt assets and timing original.

The package section uses a pinned GSAP timeline. The outgoing sheet first reveals the package statement `Trei puncte de plecare. Nicio formula rigida.` The statement then moves out and fades before any package panel reaches its dock. Three panels begin below the viewport with small horizontal offsets, then rise and dock at staggered progress points, ending as one balanced row. Only transform and opacity are animated. Reduced-motion and mobile layouts remain static, readable horizontal/stacked flows.

After the final gallery panel settles, the package stage is already mounted underneath a continuation sheet that exactly reproduces the final gallery viewport: the last work on the left and `Restul se vede in galerie.` on the right. Scroll pulls that complete final scene left and out of the viewport, progressively revealing the package statement from the right. There is no blank intermediate screen.

## Visual System

- Background: one continuous near-black and deep blue field.
- Gallery frames: rectangular, no rounding, no border.
- Package panels: hard-edged media surfaces with restrained blue illumination, no ornamental card border.
- Metadata: category plus title only.
- Final gallery panel contains a short line and one gallery CTA; it is content, not a numeric counter.

## Verification

- Playwright asserts exactly three gallery cards and three homepage package panels.
- No `01`-`05`, `05 cadre`, or old package intro appears in these scenes.
- Gallery image `border-radius` is `0px`.
- Desktop scroll sampling verifies that an incoming gallery inner wrapper moves upward while the track moves left.
- Desktop package sampling verifies staggered docking from below.
- The gallery handoff reproduces the final gallery scene, exits left, and reveals the package statement underneath.
- Reduced-motion and 430px mobile layouts remain readable and have no horizontal page overflow.

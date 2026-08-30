# FireArt Gallery And Package Refinement Design

## Approved Goal

Refine the gallery-to-packages sequence into one deliberate night-time passage. The gallery becomes shorter to travel through, its editorial copy sits centred in its half of the viewport, and the outgoing gallery sheet moves slowly enough for the next scene to be read. The three package panels are tall media-led links to real FireArtRo YouTube videos.

## Copy

### Gallery opening

- Kicker: `Selecție FireArtRo`
- Title: `Trei momente. O singură noapte.`
- Action: `Vezi selecția`

### Gallery closing sheet

- Kicker: `Dincolo de cadru`
- Title: `Spectacolul continuă.`
- Action: `Intră în galerie`

The opening and closing copy blocks are centred horizontally and vertically within their 50vw panels. The copy stays short so the gallery is led by the media rather than a large block of marketing text.

## Visual Direction

The gallery remains near-black and blue-black. Its sticky scene gains a restrained directional light field: a deep navy linear wash and sparse, low-opacity diagonal film texture. There are no gradient orbs, border frames, rounded cards, or extra decorative markers. The texture only gives the black space depth behind the text and media.

## Motion

- The gallery still travels left while incoming frames rise from below.
- Its ScrollTrigger travel length is reduced by 30 percent relative to the current gallery. The final 22 percent remains a static hold so the last frame is stable before the handoff.
- The gallery-to-packages sheet begins as the final gallery composition, then pulls left. Its timeline duration increases from 0.70 to 0.91 so the reveal reads as a smooth pull rather than a jump.
- The packages reveal copy is mounted underneath the sheet and is readable while the sheet exits. It fades before the package panels begin to rise.

## Packages

There are exactly three tall hard-edged panels: `Night Signature`, `Drone Story`, and `Hybrid`.

The text revealed by the outgoing sheet is kept equally concise: kicker `Pachete FireArtRo`, title `O noapte. Trei direcții.`. It is a transient signpost, not a second section with explanatory copy.

Each panel contains a real FireArtRo video link, a short category label, package title, one factual short description, a duration or format detail, and a visible `Vezi clipul` action. Clicking any part of the panel opens its YouTube URL in a new tab. The visual media is a poster image with a play affordance, not a silent empty video element.

The panels use the three existing FireArtRo video destinations maintained by the project data. Future URL replacements change only the `HOME_PACKAGES` data contract.

## Constraints

- Preserve mobile and reduced-motion static layouts.
- No numeric labels in gallery or package scenes.
- Keep every media edge square.
- Animate opacity and transforms only.
- No third-party embed or autoplay in the three-card lineup.

## Verification

- Focused Playwright checks prove the approved copy, centred panel structure, three visible package links, and valid YouTube targets.
- Desktop scroll samples show the gallery has a shorter pin span and a slower handoff progression.
- A desktop screenshot set captures gallery opening, final gallery hold, handoff reveal, and all three docked package panels.

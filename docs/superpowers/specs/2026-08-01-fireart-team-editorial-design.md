# FireArtRo Team Editorial Direction

## Objective

Replace the generic team introduction and rigid hover copy with a compact editorial-cinematic composition that feels specific to FireArtRo.

## Section Introduction

- Eyebrow: `ECHIPA FIREARTRO`.
- Headline: `Oamenii din spatele luminii.`
- The word `luminii.` uses self-hosted `Cormorant Garamond` at weight 500 italic in the cold blue accent.
- The remaining headline uses the existing `Sora` face at weight 500.
- The intro is compact; the team photograph begins close beneath it and reads as part of the same scene.
- No supporting paragraph, counters, cards, borders, or large empty band.

## Team Photograph

- Keep the existing original group photograph as the permanent background.
- Keep the four alpha crops extracted from that exact photograph.
- The interactive hit area remains restricted to each person's silhouette.
- Remove every role label and number from the bottom of the photograph.

## Desktop Interaction

- Hover intent delay: 200ms.
- After intent is confirmed, the active crop scales to 1.05 and receives the existing restrained blue edge light.
- The background and other people dim over 300ms.
- Leaving the silhouette clears the active state immediately; the crop and background visually settle within 300ms.
- Person 1 and person 2 show copy to their right.
- Person 3 and person 4 show copy to their left.
- Desktop click does not open a profile or dialog.

## Hover Copy

- Unframed composition; no card or panel border.
- Shared eyebrow for every person: `ECHIPA FIREARTRO`.
- Headline: the person's real name in self-hosted `Cormorant Garamond` at weight 600. Until real names are supplied, use the explicit `Nume Prenume` placeholder from centralized data.
- Body: two short lines about that person's contribution.
- No numeric labels and no role name in the eyebrow.
- Name characters animate first with a smooth stagger.
- Body line one types after the name; line two begins only after line one completes.
- Character animation uses opacity and subtle vertical movement, never stepped clipping.
- The copy follows the pointer by a small parallax offset without covering the active silhouette.

## Mobile And Reduced Motion

- Mobile keeps the current tap-accessible profile dialog because hover is unavailable.
- The desktop hover copy is hidden below 900px.
- Reduced-motion mode removes typing, parallax, and zoom interpolation while preserving all content and interaction.

## Verification

- Playwright checks the 200ms intent threshold, right/right/left/left placement, absence of bottom labels and numbering, sequential character delays, immediate state clearing, and no desktop dialog.
- Visual screenshots cover person 2 at 1600x900 and person 3 at 1920x820.
- Production build and the desktop Playwright suite must pass before completion.

# FireArtRo Team Editorial Implementation Plan

> **For agentic workers:** Execute inline in the current session. Do not dispatch subagents and do not commit or push without explicit user approval.

**Goal:** Replace the generic team intro and rigid hover treatment with the approved editorial-cinematic composition.

**Architecture:** Keep `HomeTeam.jsx` as the interaction owner and `TEAM_PLACEHOLDERS` as the only editable source for person content. CSS owns typography and motion; Playwright verifies timing, placement, and desktop/mobile behavior against the production build.

**Tech Stack:** React 18, CSS, CRA/CRACO, Playwright, self-hosted WOFF2 fonts.

## Global Constraints

- Keep the original group photograph and exact alpha crops.
- Desktop hover intent is 200ms; desktop click opens no dialog.
- Copy placement is right, right, left, left.
- No bottom labels, numbering, cards, or borders.
- Use `ECHIPA FIREARTRO`, a real name field, and two sequential body lines.
- Keep the mobile tap dialog and reduced-motion fallback.

---

### Task 1: Lock the Interaction Contract

**Files:**
- Modify: `frontend/e2e/night-runway-home.spec.js`

**Interfaces:**
- Consumes: `[data-team-person]`, `[data-team-copy]`, `[data-team-typed-char]`.
- Produces: regression coverage for the final desktop interaction.

- [ ] Assert that the first 100ms of hover has no active person and sustained hover activates the expected person.
- [ ] Assert copy placement `right`, `right`, `left`, `left`.
- [ ] Assert there are no `.fa-team__person-label` elements or visible `01`-`04` values.
- [ ] Assert `ECHIPA FIREARTRO`, a name element, two copy lines, and character-level stagger.
- [ ] Assert leaving the silhouette clears state and visual opacity within 350ms.
- [ ] Assert desktop click leaves the dialog hidden.
- [ ] Run:

```powershell
.\node_modules\.bin\playwright.cmd test --project=desktop-chromium --grep="reveals positioned team copy" --reporter=line
```

Expected before implementation: FAIL on typography or character animation assertions.

### Task 2: Install The Editorial Font And Recompose The Intro

**Files:**
- Create: `frontend/public/fonts/cormorant-garamond-italic-500.woff2`
- Create: `frontend/public/fonts/cormorant-garamond-600.woff2`
- Modify: `frontend/public/index.html`
- Modify: `frontend/src/components/night/HomeTeam.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Interfaces:**
- Consumes: official Google Fonts CSS endpoint `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,500&display=swap`.
- Produces: locally hosted `Cormorant Garamond` and the approved compact intro.

- [ ] Download the Romanian-compatible WOFF2 subsets referenced by the official CSS endpoint into `frontend/public/fonts/`.
- [ ] Add explicit `@font-face` declarations for weight 500 italic and weight 600 normal.
- [ ] Replace the intro copy with:

```jsx
<p className="fa-kicker">Echipa FireArtRo</p>
<h2 id="fa-team-title">
  Oamenii din spatele <em>luminii.</em>
</h2>
```

- [ ] Reduce the intro height and spacing so the photograph begins close beneath the headline.
- [ ] Use `Sora` 500 for the sentence and `Cormorant Garamond` 500 italic for `luminii.`.

### Task 3: Finish Hover Intent, Copy, And Typing

**Files:**
- Modify: `frontend/src/data/homeExperience.js`
- Modify: `frontend/src/components/night/HomeTeam.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Interfaces:**
- Consumes: each person `{ id, name, label, note, cutout, crop, clipPolygon }`.
- Produces: `TEAM_COPY_LAYOUT`, `renderTypedText(text, startDelay, characterInterval)`, and deterministic hover state.

- [ ] Keep `name: "Nume Prenume"` centralized until real names are supplied.
- [ ] Render no bottom labels and no numeric copy.
- [ ] Render `ECHIPA FIREARTRO`, the person name, and two concise lines.
- [ ] Animate each name/body character with opacity and subtle vertical movement; line two starts after line one finishes.
- [ ] Keep activation behind a 200ms timer and cancel it on leave or pointer cancellation.
- [ ] Add stage-level pointer fallback so active state clears whenever the pointer is outside a clipped person hit area.
- [ ] Keep visual exit transitions at or below 300ms.
- [ ] Hide desktop hover copy below 900px and preserve the mobile dialog.

### Task 4: Production Verification

**Files:**
- Verify: `frontend/e2e/night-runway-home.spec.js`
- Artifacts: `frontend/output/playwright/team-editorial-*.png`

- [ ] Build the production bundle:

```powershell
$env:CI='true'; npm run build
```

- [ ] Restart `scripts/serve-build.js` on `127.0.0.1:4173`.
- [ ] Run the focused team test, then the complete desktop Playwright project.
- [ ] Capture person 2 at 1600x900 and person 3 at 1920x820 after the complete typing sequence.
- [ ] Measure activation, deactivation, copy bounds, and horizontal overflow before reporting completion.

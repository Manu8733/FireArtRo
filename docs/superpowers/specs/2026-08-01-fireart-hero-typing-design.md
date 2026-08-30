# FireArt Hero Typing Design

## Scope

Refine only the existing homepage hero typography and title motion. Preserve the video background, logo, navigation, editorial CTA treatment, social links, scroll cue, hero positioning, and all sections below the hero.

## Approved Direction

- Use `Bricolage Grotesque` for the H1, animated keyword, and hero description.
- Use `IBM Plex Mono` for the eyebrow, CTA labels, and scroll cue.
- Keep the title structure `Spectacole în <keyword>`.
- Rotate these keywords in this exact order: `lumină.`, `mișcare.`, `aer.`, `ritm.`.
- Type each keyword from left to right.
- Hold the completed word.
- Delete it from right to left.
- Start the next word after a short pause.
- The effect is inspired by Trionn's rotating-word rhythm, but uses a real typing mechanic rather than Trionn's blurred random-character reveal.

All visible and accessible production strings use the exact Romanian text above, including diacritics.

## Visual Treatment

- Both fonts are self-hosted to avoid render-blocking external font requests.
- The static prefix uses `Bricolage Grotesque` at a strong display weight without negative letter spacing.
- The animated keyword uses the same `Bricolage Grotesque` family and a light, vibrant blue gradient from icy cyan through electric cobalt.
- `IBM Plex Mono` is reserved for small utility copy. It must not be used for the H1 or paragraph text.
- A thin blue caret is visible only while typing or deleting. It does not blink during the hold state.
- The keyword container reserves the width of `mișcare.`, the longest word, so the H1, description, and CTA positions remain stable throughout the cycle.
- The first hero entrance remains restrained: the full composition resolves once with the existing opacity/vertical motion, after which only the keyword changes.

## Motion Timing

- Hero entrance delay before typing begins: `450ms` after the hero composition starts.
- Typing speed: `85ms` per Unicode character.
- Completed-word hold: `3200ms`.
- Deleting speed: `55ms` per Unicode character.
- Empty pause before the next word: `180ms`.
- The first word is typed on initial entry rather than appearing fully formed.

The implementation uses chained timeouts driven by an explicit phase state (`typing`, `holding`, `deleting`, `paused`). Only one timeout may exist at a time, and it must be cleared whenever the phase changes or the component unmounts.

## Accessibility And SEO

- The H1 keeps a stable accessible name: `Spectacole în lumină.`.
- The animated visual keyword is `aria-hidden="true"` so assistive technology does not announce every character change.
- A visually hidden full title supplies the stable accessible text.
- With `prefers-reduced-motion: reduce`, render the static title `Spectacole în lumină.` and do not create typing timers or show a caret.
- Color contrast must meet WCAG AA against the darkest supported hero-video frame.

## Component Boundary

Create a focused `HeroTypingTitle` component responsible only for:

- the ordered keyword list;
- the typing/deleting state machine;
- the stable accessible title;
- reduced-motion behavior;
- the visual caret state.

`Hero.jsx` continues to own the hero composition, parallax behavior, copy, CTAs, and background media.

## Responsive Behavior

- Desktop, tablet, and mobile use the same word order and timing.
- The reserved keyword width scales with the H1 font size.
- The title must not create horizontal overflow at `430x932`, `844x390`, `868x698`, or `1440x900`.
- The H1 block height and CTA vertical position may vary by no more than `1px` between complete keywords.

## Tests

Playwright coverage must prove:

1. The stable accessible H1 remains `Spectacole în lumină.`.
2. The first keyword types left to right.
3. A completed keyword deletes right to left.
4. The next keyword types left to right.
5. The H1 geometry and CTA vertical position remain stable across keyword changes.
6. Reduced-motion mode renders the static first keyword without a caret or cycling.
7. Existing hero links, video, and responsive overflow assertions still pass.

## Non-Goals

- No change to the hero video or video-loading behavior.
- No GSAP or Three.js dependency for this text-only effect.
- No redesign of the navigation, logo, CTA layout, social dock, or subsequent sections.
- No commit or push unless explicitly requested by the user.

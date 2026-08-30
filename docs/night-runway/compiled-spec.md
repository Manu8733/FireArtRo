# Night Runway - Compiled Specification

## Runtime Architecture

- Keep React 19, CRA/CRACO, React Router and Framer Motion.
- Add GSAP with ScrollTrigger for deterministic section timelines.
- Keep the landing service stage video-led; do not mount a WebGL overlay over it.
- Use route-specific CSS files imported after the existing legacy stylesheet during migration.
- Preserve managed business content and admin editing contracts.

## Shared Components

- `NightButton`: primary clipped, secondary rail and text-link variants.
- `SectionSignal`: eyebrow, index and horizontal ignition line.
- `RouteShutter`: ten uniform blue-black belts that cover before navigation and reveal in reverse.
- `MediaFrame`: reusable full-bleed image/video frame with fixed aspect ratio.

## Responsive Contract

- Desktop: `1440x900`, `1366x768`.
- Tablet: `1024x768`, `844x390` landscape.
- Mobile: `430x932`, `390x844`, `360x800`, `568x320` landscape.
- No horizontal overflow, clipped type, covered CTA or control smaller than 44px.
- Reduced motion removes pinned and continuous transition behavior.

## Performance Budget

- Hero video remains prioritized; non-hero media stays lazy.
- No autoplay audio and no decorative canvas on the landing page.
- Avoid layout-triggering scroll listeners; use ScrollTrigger or requestAnimationFrame-backed transforms.

## Acceptance Criteria

- All requested public pages use the Night Runway system and no longer reuse the current card/layout language.
- Header, logo, hero video sources and social destinations remain functional.
- Every primary page has a visible contact path above the final footer.
- Playwright validates navigation, interactions, overflow, reduced motion and screenshots across the responsive contract.
- Production build succeeds with no new console errors.

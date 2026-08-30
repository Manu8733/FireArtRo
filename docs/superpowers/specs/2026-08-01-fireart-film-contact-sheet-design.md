# FireArtRo Film Contact Sheet

## Scope

Rebuild every landing-page section after the existing hero. Preserve the hero, navbar, logo, social controls, route transition system, section shutter, and compact footer.

## Direction

The page should read like an event film treatment: black editorial space, blue-black transition material, carefully sized media, short Romanian copy, and asymmetric compositions. Flystack is the primary motion reference: sticky scenes, a central object that changes with scroll, a controlled horizontal project reel, and a timeline that passes through one focal point. The implementation uses GSAP rather than copying Flystack's React state updates and Three.js model.

It must not resemble the previous pinned service selector, dashboard cards, generic carousel, numbered marketing grid, or full-screen image CTA.

## Page Flow

1. A compact intertitle introduces the production scope beside a panoramic moving slit.
2. A 200vh sticky service scene turns a stack of three medium video frames from one central composition into three distinct service frames.
3. The existing five-band section shutter bridges services and selected work.
4. A sticky horizontal project reel presents five medium frames with restrained captions.
5. An event-type index lets visitors switch a controlled preview for weddings, corporate events, and festivals.
6. A production timeline uses one fixed visual axis and four concise steps.
7. A compact closing CTA leads naturally into the existing footer.

## Motion

- Use GSAP ScrollTrigger for sticky-scene progress, media parallax, reel translation, and clip-path reveals.
- Drive transforms directly through GSAP; do not set React state on every scroll frame.
- Do not hide essential content at first paint.
- Pause videos outside the viewport and use static posters for reduced motion.
- Keep the existing single-color `#071a2c` shutter bands and slower timing.
- Do not add a persistent WebGL or Three.js canvas.
- Lazy-load below-fold video and pause it outside the viewport.

## Content Rules

- Keep headings below hero scale.
- Keep body copy to one concise sentence per service.
- Do not invent results, metrics, clients, certifications, or testimonials.
- Use direct labels and specific CTAs: gallery, packages, and contact.

## Responsive Rules

- Media must never become full-screen on mobile.
- Interactive rows must retain 44px touch targets.
- All grids collapse without horizontal scrolling.
- Decorative motion is disabled for `prefers-reduced-motion`.

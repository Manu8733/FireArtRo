# FireArtRo Gallery Cinematic Comets

## Purpose

Replace the current free-wandering gallery threads with a directed five-comet system that reads as premium pyrotechnic choreography. Motion must remain alive and varied without producing accidental loops, worm-like paths, disconnected flares, or repeated center-screen meetings.

## Design contract

| Field | Decision |
| --- | --- |
| Screen job | Add atmosphere and recognizable FireArtRo motion while keeping gallery images and controls dominant. |
| Signature | Five warm comet trails independently cross the viewport, then occasionally form a travelling two- or three-comet helix, one shared moving tip, and a clean burst. |
| Visual language | Near-black field; warm-white cores, champagne tails, restrained copper accents; no blue/purple sci-fi glow. |
| Motion character | Fast, precise, mostly linear travel with physically limited bends. Choreography is directed and seeded, not unconstrained random wandering. |
| Placement | Encounters use scored off-center safe zones. The system avoids the viewport center, recent meeting zones, gallery headings, controls, and primary cards. |
| Responsiveness | Same choreography on desktop and mobile; mobile uses shorter trails and lower sample counts, not a disabled or simplified interaction. |
| Accessibility | `prefers-reduced-motion` renders a quiet static composition. Canvas remains decorative and outside focus order. |
| Performance | Fixed-step simulation, capped device pixel ratio, no per-frame object allocation, one WebGL canvas, no layout reads inside the render loop. |

## Spatial director

The canvas uses normalized screen-space candidate zones instead of a fixed center:

- upper-left edge: `(-0.68, 0.50)`
- upper-right edge: `(0.66, 0.48)`
- middle-left: `(-0.76, 0.02)`
- middle-right: `(0.76, -0.04)`
- lower-left: `(-0.62, -0.52)`
- lower-right: `(0.64, -0.50)`
- high crown: `(0.08, 0.66)`
- low horizon: `(-0.10, -0.66)`

Before an encounter, candidate zones are projected to pixels and scored:

1. reject zones intersecting protected DOM rectangles plus a 56px desktop / 28px mobile margin;
2. reject the central 28% of the viewport;
3. penalize distance under 35% of the viewport diagonal from the previous encounter;
4. reward zones aligned with the selected comets' current velocity;
5. select from the two highest scores using seeded variation.

Protected rectangles are sampled on resize and scroll-settle, never each frame. They include the gallery title, filters, visible cards, header, dialogs, and cookie panel.

## Motion model

Each comet follows jerk-limited steering rather than direct random rotation:

- maximum speed, acceleration, and jerk are explicit per device class;
- curvature is constrained by a minimum turn radius;
- cruise paths are rebuilt as short cubic Hermite segments using current position and velocity;
- path changes occur only at segment boundaries or boundary-return events;
- off-screen excursions last at most 0.9 seconds;
- at least two comets remain visible at all times.

The trail uses a resampled Catmull-Rom curve but suppresses lateral deformation when curvature is low. This preserves long straight meteor silhouettes and permits controlled bending only during a turn or choreography beat.

## Choreography beats

Only one major beat runs at a time.

### Cross

Two comets pass through a shared off-center zone on different depth planes. They do not collide and continue immediately.

### Travelling braid

Two or three comets approach parallel guide rails and rotate around a shared carrier trajectory while the complete formation continues travelling through 3D space. The carrier is a cubic Hermite curve with a clear entry tangent, forward velocity, controlled depth change, and an off-center exit point. It never stops at a fixed meeting point.

The comets complete 1.5 to 2 turns around the moving carrier. Their local spiral plane is built from the carrier tangent using a parallel-transport frame, preventing sudden twisting when the path bends. The projected radius remains at least 52px desktop / 34px mobile during the readable braid phase, then contracts continuously while the carrier keeps moving.

### Fusion

The participant spread must fall below a screen-space threshold before the shared tip appears. The tip follows the actual participant centroid and keeps travelling along the carrier tangent; it never pauses at a fixed coordinate or follows an independent target. Fusion remains visible for 420-620ms while advancing at 30-45% of cruise speed.

### Burst

Comets leave the moving common tip on separately calculated 3D tangents with asymmetric timing. Their inherited forward velocity prevents the burst from looking like a stationary radial explosion. A restrained spark fan marks separation; no circular explosion sprite is used.

## Visual construction

Each comet is composed of:

1. a 0.8-1.0px warm-white core;
2. a 2.6-3.4px low-opacity champagne halo;
3. a compact elliptical head aligned to velocity;
4. sparse ember particles emitted backwards with drag and short life;
5. opacity taper based on trail age and screen velocity.

Palette:

- core: `#fff6df`
- champagne: `#efc77e`
- copper: `#d96f45`
- ember: `#b94a2d`
- background: transparent over `#050708`

No large round glow, neon blue, purple gradient, or glow over readable content.

## Timing

- first visible cross: within 500ms after canvas initialization;
- first travelling three-comet braid: within 1.4s;
- major beat cadence: 2.8-4.8s;
- autonomous cruise between beats: 1.2-2.6s;
- no identical beat, zone, or participant group twice in succession.

## Acceptance criteria

- A travelling three-comet helix and moving fusion tip are unmistakable within five seconds on desktop and mobile.
- The helix carrier advances at least 28% of the viewport width or 22% of its height during the braid; a stationary orbit fails acceptance.
- Travelling carrier paths cross at least four distinct off-center zones during a 30-second capture.
- The shared tip is shown only when participant spread is below 18px desktop / 12px mobile.
- Trails remain predominantly straight outside choreography and never resemble short organic worms.
- At least two comets remain visible; none stays absent for over 0.9 seconds.
- No animation overlaps controls strongly enough to reduce text contrast.
- No horizontal overflow or console errors at 1440x900, 1366x768, 390x844, and 360x740.
- Reduced-motion mode is static and legible.
- The production build completes successfully.

## Scope

This pass changes only the gallery atmospheric canvas and its integration hooks. Gallery content, filtering, cards, navigation, and business copy remain unchanged.

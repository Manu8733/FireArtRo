# FireArt atmospheric backgrounds and homepage gallery scale

Date: 2026-09-02  
Status: Approved direction — option 1

## Objective

Give the dark FireArt interface more depth by placing real FireArt photography behind the selected homepage sections and public-page surfaces. The treatment must feel like light from a live show passing through smoke: predominantly black, with restrained blue, magenta, red, or amber color blur. Content, controls, layout, and existing motion remain crisp and readable.

The homepage horizontal gallery must also feel substantial on laptop and desktop viewports. Only that section grows; the navbar, footer, buttons, and unrelated sections keep their current scale.

## Visual direction

The shared treatment uses three layers:

1. A near-black base (`#020407` to `#05080d`).
2. One existing FireArt WebP photograph, enlarged slightly, darkened, softly blurred, and kept between 10% and 16% effective visibility on desktop.
3. One or two broad radial color washes derived from the photograph, followed by a dark contrast veil beneath the content.

The result must still read as black at first glance. The photograph should be perceived as atmosphere and light, not as a second hero image. Decorative layers are non-interactive, remain behind content, and do not affect document geometry.

## Image assignment

- Homepage gallery: `fireartro-drone-show-focsani-dji-0768-enhanced-nr.webp`, using its blue night sky and warm city lights as a diffused full-stage echo of the gallery content.
- Homepage packages: keep `fireartro-artificii-noapte-spectacol-091.webp`, but make the red fire/smoke field visibly atmospheric rather than nearly imperceptible.
- Homepage About: keep the existing `MEDIA.fireworksSky` image, reposition and blur it so light is distributed across the section instead of appearing only at the lower edge.
- Contact: `fireartro-artificii-noapte-spectacol-070.webp`, darkened enough that the form remains the highest-contrast surface.
- FAQ: `fireartro-drone-show-neversea-show-img-4351.webp`, reduced to abstract blue, magenta, and orange points behind the hero and questions.
- Gallery page: `fireartro-drone-show-untold-img-6900-2.webp`, used as a diffuse violet/blue atmosphere behind the page header and first mosaic rows.
- Packages page: `fireartro-artificii-noapte-spectacol-091.webp`, aligned with the red/amber identity of the homepage package section.

All images already exist as optimized WebP assets in the project. No new media files are introduced.

## Homepage gallery scale

On fine-pointer desktop viewports from 1366 px upward, a centered gallery image must occupy 54%–60% of the viewport width, while remaining constrained to a readable cinematic maximum. Its height remains bounded by the available viewport so the caption stays visible.

Mobile, tablet portrait, and touch-landscape framing remain unchanged. The horizontal panel geometry grows on desktop, and its scroll-runway multiplier is reduced enough to keep the current interaction duration. The intro/outro timing and smooth transition into packages remain intact.

## Homepage package copy

- Replace `Trei moduri de a aprinde noaptea.` with `Fiecare noapte cere alt spectacol.`
- Remove `Alege un punct de plecare. Configurația finală se adaptează locului, ritmului și momentului.` completely.
- Keep package names, descriptions, facts, actions, and data unchanged.

## Responsive behavior

- Background layers use full-section pseudo-elements or existing decorative wrappers; they never introduce horizontal overflow.
- Desktop imagery uses a larger blur radius and broader crop. Mobile uses a tighter crop and no more than 12% effective image visibility so small screens stay legible.
- Background positions are expressed per surface with CSS custom properties or focused selectors, not device-specific pixel coordinates.
- Existing content containers, touch targets, safe-area behavior, navbar, footer, and buttons are preserved.
- Decorative images have no accessibility announcement and no pointer interaction.

## Implementation boundaries

Expected edits are limited to the relevant homepage component/copy and the existing style sheets for Home, Contact, FAQ, Gallery, and Packages. Each route keeps its decorative layer in its own stylesheet so no unrelated page inherits the effect.

The hero video, package data, form behavior, routing, header, footer, social controls, and deployment configuration are out of scope.

## Verification

- Add a regression check that the homepage gallery card occupies at least 54% of a 1512×982 viewport when centered.
- Assert that each requested surface has a real photographic background layer while content remains above it.
- Check for horizontal overflow and clipped content at 375×812, 430×932, 768×1024, 1366×768, 1512×982, 1920×1080, 3440×1440, and 5120×1440.
- Visually review homepage gallery, About, homepage packages, Contact, FAQ, Gallery, and Packages in desktop and mobile views.
- Run the production build and focused Chromium/WebKit/Firefox checks before completion.

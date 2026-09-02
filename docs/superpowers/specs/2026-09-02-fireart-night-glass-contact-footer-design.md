# FireArtRo Night Glass contact and footer design

## Scope

Refine the existing public-site presentation without changing content, routes, form behavior, validation, navigation structure, or the approved visual identity.

The change covers:

- background continuity across the homepage Gallery, Packages, and About sections;
- the Contact page form surface, fields, direct-contact actions, and related public CTA styling;
- the legal row in the shared footer.

The reviews integration is explicitly outside this implementation and remains a separate follow-up.

## Background continuity

The homepage Gallery section is the visual reference for darkness and image visibility. Packages and About will use the same atmospheric image treatment, opacity, blur, saturation, brightness, base color, and dark overlay strength.

The three sections must read as one continuous visual field:

- no separator rule between Packages and About;
- no different blue veil or local color reset in About;
- no new image or decorative layer;
- only a restrained local readability gradient behind About copy, without changing the overall perceived darkness.

The existing responsive background positioning remains fluid, with the same mobile treatment applied consistently to all three sections.

## Contact form

The Contact page keeps its current two-column content structure and all form logic. The form becomes a Night Glass surface that belongs to the same visual system as the rest of the site:

- translucent obsidian panel instead of an opaque rectangular card;
- subtle blue-gray hairline and a quiet top highlight;
- clipped editorial corners consistent with the shared NightButton geometry, without generic rounded-card styling;
- grouped form sections separated by low-contrast lines;
- inputs and selects use a translucent inset surface, clearer spacing, and blue emphasis only on hover or keyboard focus;
- errors, consent, optional details, loading, and success states retain their existing semantics and behavior.

No submission endpoint, field name, validation rule, or copy changes.

## Shared actions

Equivalent public conversion actions use the existing NightButton visual language. Telefon, Email, and WhatsApp become equal-height secondary actions with the same clipped geometry, typography, border behavior, hover movement, and focus treatment.

The consistency pass applies only to equivalent public CTAs. Filters, accordion controls, gallery controls, social icons, cookie controls, and Admin controls keep their role-specific treatment.

## Footer

Remove the visible legal-company string containing the company name and CUI from the footer only. Legal pages and structured business data remain unchanged.

The bottom row becomes a balanced two-part layout:

- copyright aligned to the start;
- legal links and Setari cookies grouped and aligned to the end on desktop;
- on narrow screens, copyright appears first and the legal group wraps predictably below it with consistent touch targets.

No legal links are removed.

## Responsive behavior

All updated surfaces use the existing fluid type and spacing tokens. The contact form remains two columns where space permits and collapses to one column at the current structural breakpoint. Direct-contact actions wrap without horizontal overflow and become full-width only where needed.

## Verification boundary

The implementation will be limited to the affected public components and styles. No unrelated page redesign, data migration, or review-provider integration is included.

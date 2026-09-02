# FireArtRo Night Glass contact and footer design

## Scope

Refine the existing public-site presentation without changing content, routes, form behavior, validation, navigation structure, or the approved visual identity.

The change covers:

- background continuity across the homepage Gallery, Packages, and About sections;
- the Contact page form surface, fields, direct-contact actions, and related public CTA styling;
- secure Google and Facebook review rails above the shared footer;
- the legal row in the shared footer.

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

## Verified reviews

Reviews move from the current browser-managed placeholder model to one public backend endpoint. Provider credentials never enter the React bundle.

Google is enabled only when both `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` are present. Facebook is enabled only when both `META_PAGE_ID` and `META_PAGE_ACCESS_TOKEN` are present. Each provider is queried independently, normalized to a small public review model, and omitted when configuration is incomplete, the provider request fails, or no real review text is returned.

The endpoint never returns credentials or raw provider responses. Requests use a short timeout and a bounded in-memory cache so repeated page visits do not repeatedly consume provider quota. Failure of one provider does not hide valid data from the other provider.

The frontend renders no placeholder, setup message, empty shell, or fabricated rating. If neither provider returns usable reviews, the complete reviews section is absent from the document.

The shared `PageEnd` placement remains the single integration point, immediately before the footer on every public page and outside the Admin route.

### Review presentation and motion

Both providers use the same Night Glass card system: translucent black surfaces, square editorial edges, a subtle blue-gray hairline, restrained provider accent, readable review text, author attribution, and rating only when supplied by the provider.

The Google rail moves continuously from left to right. The Facebook rail moves continuously from right to left. Tracks duplicate only rendered provider data to form a seamless loop; duplicates are hidden from assistive technology. Motion pauses during pointer hover or keyboard focus, and `prefers-reduced-motion` produces a static horizontally scrollable row.

The layout remains full-width for motion while card content and headings stay visually aligned with the shared content container. Cards use fluid widths and cannot create page-level horizontal overflow.

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

The implementation will be limited to the affected public components, styles, review endpoint, provider normalization, and documented server environment variables. No unrelated page redesign or data migration is included.

Review behavior is verified without real credentials by mocking provider responses. Live credentials are not requested, committed, printed, or exposed in frontend environment variables.

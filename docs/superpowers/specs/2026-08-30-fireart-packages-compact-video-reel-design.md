# FireArtRo Packages Compact Video Reel

## Goal

Replace the current disconnected package configurator with a compact package reel that keeps the catalog understandable on desktop, tablet, and mobile.

## Layout

- Keep a short page heading and the existing package category tabs.
- Show the available packages in the selected category as compact cards immediately beneath the category tabs.
- Each card contains a fixed 16:9 YouTube preview, category, title, and the package's short descriptor. The selected card has a clear but restrained state.
- Render one selected-package detail surface under the card rail. It contains a smaller 16:9 preview, title, description, three decision facts, optional inclusion details, and the existing contact CTA.
- Clicking the selected package's preview opens an expanded, distraction-free video dialog. It is not an oversized permanent media frame.
- Remove the duplicate thumbnail strip below the detail surface.

## Interaction And Data Contracts

- Category switching selects the first available package in that category.
- Card controls retain keyboard tab semantics and arrow-key navigation.
- The selected package continues to pass `package_id`, `package_title`, and its category to the contact flow.
- YouTube thumbnails are still derived from the Admin-managed `videoUrl`; local image/category fallbacks remain available.
- Reduced-motion mode switches the selected package without transitional movement.

## Responsive Rules

- Desktop uses a compact card rail followed by a two-column detail surface.
- Tablet permits fewer card columns without enlarging the video frame beyond a useful scanning size.
- Mobile uses a horizontally scrollable card rail, then the selected preview and content in a single column. All interactive controls remain at least 44px high.

## Verification

- Playwright checks category and card selection, YouTube preview source, expanded video dialog, keyboard navigation, CTA prefill, and desktop/mobile overflow.

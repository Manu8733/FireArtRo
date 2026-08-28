# FireArtRo gallery source-crop correction

## Objective

Correct the gallery portraits that became abnormally narrow during import, while preserving the original photographic composition and the existing gallery interaction.

## Root cause

The affected source exports contain full-width portrait photographs with black bars above and below. The import rule cropped the source horizontally to the center 49%, reducing a normal portrait ratio of about 0.56 to about 0.28. The lightbox correctly preserved that damaged asset ratio. Reusing the damaged WebP for a later 3:4 crop removed further content and is not an acceptable source.

## Processing design

- Rebuild affected images from the original PNG/JPEG files under `tmp/source-media-20260801` or from the last intact tracked source when no raw source is available.
- Remove only confirmed black/device-interface margins from screenshot exports.
- Keep the full photograph width and its natural portrait composition; do not force every preview to 3:4.
- Preserve SEO-oriented WebP filenames and WebP output.
- Update catalog width, height, and aspect ratio values from the generated files.
- Add a media revision to changed gallery URLs so existing immutable local-browser cache entries cannot serve the damaged versions.

## Gallery behavior

The lightbox continues to use the image's decoded natural ratio, `object-fit: contain`, and viewport-anchored previous, next, and close controls. Gallery cards may use their existing editorial crops, but the preview must show the complete corrected image.

## Verification

- Compare every rebuilt output against its original source.
- Verify dimensions and WebP format programmatically.
- Open affected items in a fresh Playwright context and confirm natural, frame, and rendered ratios match.
- Capture desktop and mobile screenshots and verify controls remain fixed outside the image frame.
- Run the gallery-focused Playwright tests and the production build.

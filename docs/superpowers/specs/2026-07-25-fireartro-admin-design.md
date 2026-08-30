# FireArtRo Admin Design

## Objective

Replace the raw JSON textarea at `/admin` with a compact visual content manager that a non-technical operator can use safely.

## Experience

- A quiet, light operational interface distinct from the public cinematic site.
- A module sidebar, searchable item list, and field editor.
- Clear dirty/saved status, explicit save, section reset, import, and export.
- Array modules support create, duplicate, delete, and reorder.
- Object modules expose normal fields instead of JSON.
- Advanced JSON remains available inside a collapsed panel.

## Managed modules

- Company details and social links
- Homepage slides
- Gallery media
- Packages
- Frequently asked questions
- Testimonials
- Partners
- Cookie copy and retention

## Media workflow

Image fields accept either a URL/path or a local image. Local files are validated, resized to a maximum of 1800 pixels, encoded as WebP, previewed, and stored with the content in the current browser. A 6 MB source file limit prevents accidental browser-storage exhaustion.

## Data flow

The editor starts from code defaults merged with `localStorage`. Saving writes the complete managed-content object and broadcasts the existing update event. Public components use `useManagedContent`, so saved FAQ, package, gallery, testimonial, partner, cookie, company, and social data update in the same browser.

## Boundaries

This is a browser-local CMS. It does not claim server-side authentication or global publishing. JSON export/import is the migration and backup mechanism until a real authenticated CMS backend is connected.

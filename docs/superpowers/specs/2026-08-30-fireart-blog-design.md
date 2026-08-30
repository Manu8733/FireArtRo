# FireArtRo Blog Design

## Objective

Add a real public Blog to FireArtRo. Articles are created and published from the existing Admin area, stored in the existing MongoDB-backed API, and shown to every visitor. The initial Blog contains no demonstration articles and no invented copy.

## Approved scope

- Add a Blog module to `/admin`.
- Show the three newest published articles near the bottom of the landing page.
- Add a `Vezi tot blogul` action from the landing page to `/blog`.
- Add a complete Blog archive at `/blog`.
- Add an article page at `/blog/:slug`.
- Add `Blog` to the public footer navigation.
- Support draft and published articles.
- Support an optional optimized cover image.

Comments, author profiles, subscriptions, search, filtering, rich HTML, and sample articles are outside this scope.

## Architecture

The public Blog uses the existing FastAPI and MongoDB backend rather than the browser-local `useManagedContent` store. Browser-local storage is not a publishing mechanism because changes would only be visible in the browser that created them.

The feature is split into four bounded units:

1. The backend owns validation, persistence, publication state, slug uniqueness, and protected mutations.
2. A small frontend Blog client owns API requests and normalized loading/error handling.
3. Public Blog components own the landing preview, archive, and article presentation.
4. A dedicated Admin Blog panel owns authenticated article editing without changing the storage behavior of existing Admin modules.

The frontend reads its API origin from `REACT_APP_BACKEND_URL`, following the existing quote form convention.

## Article model

Each MongoDB article document contains:

- `id`: generated UUID.
- `slug`: generated from the title on creation, normalized for Romanian diacritics, unique, and stable after creation.
- `title`: required plain text, maximum 160 characters.
- `excerpt`: optional plain text used on cards, maximum 320 characters.
- `body`: required plain text, maximum 50,000 characters. Blank lines form paragraphs.
- `category`: optional plain text, maximum 80 characters.
- `cover_media_id`: optional identifier for the uploaded cover image.
- `cover_alt`: optional alternative text, required by Admin when a cover image exists.
- `status`: `draft` or `published`.
- `created_at`: server timestamp.
- `updated_at`: server timestamp.
- `published_at`: set by the server on the first transition to `published` and retained on later edits.

The API rejects empty titles, empty bodies, invalid statuses, oversized values, and malformed identifiers. Public responses never expose MongoDB `_id` values or authentication data.

## API contract

Public endpoints:

- `GET /api/blog/posts` returns published article summaries sorted by `published_at` descending. An optional validated `limit` supports the three-item landing preview.
- `GET /api/blog/posts/{slug}` returns one published article. Draft, missing, or invalid slugs return `404`.
- `GET /api/blog/media/{media_id}` returns an uploaded cover image with its content type and public cache headers.

Admin endpoints:

- `GET /api/admin/blog/posts` returns drafts and published articles.
- `POST /api/admin/blog/posts` creates an article.
- `PUT /api/admin/blog/posts/{id}` updates an article.
- `DELETE /api/admin/blog/posts/{id}` deletes an article after confirmation.
- `POST /api/admin/blog/media` uploads one optimized cover image.

Every Admin endpoint requires the existing `X-Admin-Key` header. The key is entered in a password field, held only in React memory for the current page session, and never embedded in a `REACT_APP_*` variable, URL, article document, or local storage.

The existing 32 KB request limit remains in place for normal API requests. Protected Blog article create/update requests have a 128 KB limit so the validated 50,000-character body and JSON envelope can be saved without contradiction. The protected media endpoint has a separate 6 MB request limit. Images are validated and optimized in the browser before upload, then stored in MongoDB GridFS so article documents do not contain large data URLs.

Backend CORS configuration adds the required `PUT` and `DELETE` methods while preserving the existing origin allowlist and `X-Admin-Key` restriction. Replacing or deleting an article removes its no-longer-referenced cover from GridFS only after the article mutation succeeds. A failed article save never deletes the previously published cover.

## Admin experience

The existing Admin sidebar gains a `Blog` module. It opens a dedicated panel instead of the generic browser-local collection editor.

On first entry, the panel requests the Admin key. A failed key shows `Cheia Admin nu este validă.` and keeps all mutation controls unavailable. Refreshing the page requires the key again.

After authentication, the panel provides:

- A list of articles with title, draft/published status, and last update date.
- `Articol nou` to start an empty draft.
- Fields for title, excerpt, body, category, cover image, cover alternative text, and publication status.
- A live read-only slug preview after the article is created.
- `Salvează articolul`, with visible saving, saved, and error states.
- `Șterge articolul`, guarded by a confirmation dialog.
- An explicit empty state: `Nu există articole. Creează primul articol.`

Creating an article never publishes it implicitly. New articles start as drafts. Publishing is an explicit status change followed by save.

The body editor is a large multiline text field. The public renderer turns blank-line-separated blocks into paragraphs and preserves single line breaks without accepting raw HTML. This keeps the first version safe and simple while supporting normal long-form writing.

## Public experience

### Landing page

A new Blog section is placed in `PageEnd`, before connected reviews and the footer. This satisfies the requested low landing-page position without interrupting the existing gallery-to-packages-to-about sequence.

The section requests the newest three published articles only. On desktop, the newest article receives the larger editorial position and the other two form a quieter secondary column. On mobile, all articles use one readable column in the same chronological order.

Every card contains only available managed data: optional category, formatted publication date, title, optional excerpt, optional cover, and a clear article link. Missing optional data does not leave empty labels or decorative placeholders.

The section ends with `Vezi tot blogul`, linking to `/blog`. When there are no published articles, or the preview request cannot be completed, the entire landing section stays hidden and the existing page flow remains intact.

### Blog archive

`/blog` uses the established Night Runway navbar, page shell, connected reviews, and footer. It shows all published articles newest first in an editorial card grid. The page contains no fabricated content.

When the collection is empty, the archive remains available and shows `Nu există articole publicate momentan.` On a network failure, it shows a concise retry action rather than claiming the Blog is empty.

### Article page

`/blog/:slug` uses a focused reading layout with category, publication date, title, optional excerpt, optional cover, and the paragraph-rendered body. It includes a visible route back to `/blog` and the standard page ending.

A missing or draft article shows an accessible not-found state with a link back to the Blog archive.

## Visual direction

The Blog extends the existing FireArtRo Night Runway language rather than introducing a separate template. It reuses the current color variables, shell widths, navbar, footer, type hierarchy, focus treatment, and reduced-motion behavior.

The signature layout is the asymmetric three-article landing composition: one lead story and two compact stories. The hierarchy communicates publication recency rather than using decorative numbering. Cover images remain optional; text-only articles use spacing and typography, not invented imagery.

All interactive controls have visible keyboard focus and a minimum practical touch target. The layout must not create horizontal overflow at 1440×900, 430×932, 844×390, or 568×320.

## Metadata and discovery

- `/blog` receives a descriptive Blog title, description, canonical path, and a `Blog` schema graph based only on published API data available to the page.
- Article pages receive title, excerpt-based description, canonical path, and `BlogPosting` structured data using the stored publication/update dates and optional cover.
- The footer link and landing-page action provide internal discovery without adding a new primary-navbar item, because the approved request names the footer specifically.

## Loading and failure behavior

- Public lists use a compact loading state that does not shift the surrounding layout excessively.
- The landing preview fails closed by hiding itself.
- The archive distinguishes a genuine empty collection from a request failure.
- The Admin keeps the current draft on save/upload failure and states the corrective action.
- Image upload errors do not discard article text.
- Deleting an article removes it from public results immediately after the backend confirms deletion.

## Verification contract

Implementation follows test-first development.

Backend tests must prove:

- Public endpoints return only published articles in newest-first order.
- `limit=3` returns at most the three newest published articles.
- Draft and missing slugs return `404` publicly.
- Admin list/create/update/delete and media upload reject missing or invalid Admin keys.
- Validation rejects invalid or oversized fields.
- Publishing sets `published_at`, and later edits preserve it.
- Duplicate titles receive unique stable slugs.

Frontend tests must prove:

- No landing Blog section is rendered for an empty successful response.
- Exactly the newest three returned articles render in the landing preview.
- `Vezi tot blogul`, footer `Blog`, archive cards, and article links use the approved routes.
- Draft data is never presented through public UI fixtures.
- Archive empty, error, and retry states are distinct.
- Admin creation starts as draft and sends authenticated save/delete requests.
- Article bodies render as text paragraphs without interpreting raw HTML.

Playwright acceptance checks cover landing, archive, article, footer navigation, Admin editing, keyboard access, reduced motion, and horizontal overflow on the approved desktop and mobile viewports. A production build must complete before serving the compiled app for browser checks.

## Existing-work boundary

The repository currently contains unrelated modified and untracked work. Blog implementation must preserve it. Changes are limited to new Blog files and the smallest necessary additions to routing, `PageEnd`, footer navigation, Admin module registration/panel mounting, backend routes/models, configuration, and focused tests.

# FireArtRo Vercel Live CMS Admin Design

## Objective

Replace the browser-local FireArtRo Admin with a production content-management system. A non-technical operator signs in at `/admin`, edits an automatically saved draft, previews it, and publishes one coherent version that becomes visible on the public site without a Git commit, push, or frontend redeploy.

The implementation remains in the existing React/FastAPI repository and is deployed as one Vercel project. MongoDB Atlas and Vercel Blob are provisioned and connected from the Vercel dashboard.

## Approved editorial workflow

- Every field change is saved automatically to the server-side draft after a short debounce.
- Autosave never changes the public site.
- `Previzualizează` renders the current draft without publishing it.
- `Publică modificările` atomically promotes the complete draft to the public version.
- The public site reads only the latest published version.
- Every publication creates an immutable revision that can be inspected and restored.
- Restoring a revision creates a new draft first; it does not silently overwrite the public site.
- Publishing is blocked while the draft is invalid or an upload/save is still running.

## Selected architecture

### One Vercel project

The existing CRA frontend remains the public and Admin interface. The existing FastAPI application is exposed as a Vercel Python Function under `/api/*`. The SPA fallback applies only to non-API routes, so `/api/*` can no longer be rewritten to `index.html`.

The deployment contains:

1. `frontend/build` for the React application.
2. A supported Vercel Python entrypoint importing `backend.server:app`.
3. MongoDB Atlas connected through the Vercel Marketplace and exposed to the function through `MONGODB_URI`.
4. A public Vercel Blob store for Admin-managed images and videos, exposed through `BLOB_READ_WRITE_TOKEN` only to server-side code.
5. Vercel environment variables for production, preview, and development.

This preserves the working frontend and backend instead of migrating the entire site to Next.js or adopting a third-party CMS with a separate visual language.

### Content boundaries

The CMS uses two persistence shapes:

- A versioned site-content snapshot for configuration and page content that must publish atomically.
- Dedicated collections for entities with their own lifecycle: Blog articles, quote requests, Admin sessions, login attempts, and media records.

The public snapshot is deliberately coarse-grained. A package title, its CTA, the navigation label, and related page copy cannot land in separate half-published states.

## Data model

### `site_content_drafts`

There is one active draft document:

- `id`: fixed value `primary`.
- `schema_version`: positive integer controlled by code migrations.
- `content`: the complete validated managed-content object.
- `base_revision_id`: publication revision from which editing started.
- `version`: monotonically increasing integer used for optimistic concurrency.
- `updated_at`: server timestamp.
- `updated_by`: Admin identity identifier.

Draft updates require the version the editor last loaded. A stale editor receives `409 Conflict` rather than overwriting newer work.

### `site_content_publications`

There is one active public document:

- `id`: fixed value `current`.
- `schema_version`.
- `content`: complete validated published snapshot.
- `revision_id`.
- `published_at`.
- `published_by`.

Publishing replaces this document in one database operation after validating the entire draft.

### `site_content_revisions`

Each publish creates one immutable revision:

- `id`: generated UUID.
- `schema_version`.
- `content`.
- `summary`: optional plain-text publication note, maximum 240 characters.
- `published_at`.
- `published_by`.

Revision lists return metadata only. A separate protected request loads a full historical snapshot.

### Existing collections

- `blog_posts` keeps the existing Blog model and publication behavior.
- `quotes` gains protected list, detail, status, and internal-note operations.
- `admin_sessions` stores opaque hashed session identifiers with an expiry and MongoDB TTL index.
- `admin_login_attempts` provides server-safe throttling across Vercel Function instances.
- `cms_media` records Vercel Blob pathname, URL, media type, dimensions, byte size, alternative text, creation time, and reference state.

## Managed content contract

The server owns the authoritative schema, length limits, URL normalization, allowed enum values, duplicate-ID checks, and cross-field rules. Invalid data never reaches the draft or public snapshot.

The first schema version covers:

- Company identity, direct contact details, business hours, social links, and SEO defaults.
- Navigation and footer labels/links that are content rather than fixed application routes.
- Homepage hero copy and CTA labels, gallery-section copy, packages-section copy, About copy, partners-section copy, and final CTA copy.
- Gallery media and category metadata.
- Packages, package features, suitability, duration, video selection, and quote prefill identifiers.
- Frequently asked questions.
- Testimonials and partner entries.
- Review-section presentation settings; provider credentials remain environment variables and are never returned to Admin.
- Contact-page copy and selectable form options.
- Cookie-banner content and retention setting.
- Privacy, terms, and cookie-policy content while preserving the existing legal routes.

Layout code, arbitrary CSS, raw HTML, executable scripts, secrets, backend integration tokens, and Vercel configuration are not editable content.

## API contract

### Public content

- `GET /api/content` returns the current published snapshot, revision ID, and publication timestamp.
- The response uses an `ETag` derived from the revision ID and `Cache-Control: no-cache, must-revalidate` so a refresh sees a new publication without serving a stale CDN copy.
- If no publication exists yet, the API returns a server-seeded snapshot based on the checked-in defaults.
- Existing public Blog and review endpoints remain public and receive consistent failure envelopes.

### Authentication and session

- `POST /api/admin/auth/login` accepts username and password.
- `GET /api/admin/auth/session` returns the current safe Admin profile and a CSRF token.
- `POST /api/admin/auth/logout` revokes the current session.
- Successful login sets an opaque `HttpOnly`, `Secure`, `SameSite=Strict`, path `/api/admin` cookie.
- State-changing requests require both the session cookie and an `X-CSRF-Token` header.
- Password verification uses a bcrypt hash stored in a sensitive Vercel environment variable. No password, password hash, API key, session token, or Blob token is returned to React or saved in localStorage.
- Login responses are deliberately generic, rate-limited, and constant-shape.
- There is no public registration or password-reset flow in this single-operator release.

### Draft and publication

- `GET /api/admin/content/draft` loads the active draft and publication metadata.
- `PUT /api/admin/content/draft` validates and autosaves the complete draft using optimistic concurrency.
- `POST /api/admin/content/publish` validates and publishes the current draft, optionally recording a short summary.
- `GET /api/admin/content/revisions` returns revision metadata newest first.
- `GET /api/admin/content/revisions/{revision_id}` returns one historical snapshot.
- `POST /api/admin/content/revisions/{revision_id}/restore` copies a historical snapshot into a new draft version.

### Media

- `GET /api/admin/media` lists managed media.
- `POST /api/admin/media` accepts one validated image or video and stores it in Vercel Blob.
- `PATCH /api/admin/media/{media_id}` updates alternative text and safe metadata.
- `DELETE /api/admin/media/{media_id}` deletes only unreferenced media after explicit confirmation.
- Uploads have server-enforced type and byte limits. Images are optimized before upload and videos use an explicit larger limit documented in the Admin UI.
- Replacing content never deletes the old Blob until the new draft is safely stored. Published or historical references keep their Blob alive.

### Blog and quote requests

The Blog Admin stops requesting an `X-Admin-Key` and uses the global Admin session. Its draft/publish model remains article-specific.

Quote management adds:

- `GET /api/admin/quotes` with status and search filters.
- `GET /api/admin/quotes/{quote_id}`.
- `PATCH /api/admin/quotes/{quote_id}` for `new`, `contacted`, `qualified`, `closed`, or `spam`, plus a private note.

Public quote submission remains unauthenticated, validated, honeypot-protected, and rate-limited.

## Admin experience

### Login

`/admin` first shows a focused FireArtRo login screen. It contains username, password, submit state, a generic invalid-credentials error, and no public navigation. A successful session opens the dashboard; expiration returns to login without losing unsaved local field text until the user chooses to discard or signs back in.

### Dashboard

The first screen communicates operational state rather than showing a raw editor:

- Published revision and publication time.
- Draft state: synchronized, saving, unsaved, invalid, conflict, or offline.
- Count of unpublished changes.
- New quote-request count.
- Blog draft count.
- Google and Facebook review integration state without exposing credentials.
- Primary actions: `Continuă editarea`, `Previzualizează`, and `Publică modificările`.

### Editing workspace

The existing module/sidebar idea is retained but rebuilt around server state:

- A persistent section navigator grouped into `Site`, `Pagini`, `Conținut`, `Blog`, `Cereri`, and `Sistem`.
- Searchable collection lists for packages, gallery, FAQ, testimonials, and partners.
- Normal typed fields instead of raw JSON.
- Add, duplicate, reorder, archive/delete, and undo for collection entries.
- Inline field errors and a publication-level error summary linking to each invalid field.
- A visible autosave indicator based on server confirmation, never a misleading timer-only `salvat` message.
- A comparison panel showing changed fields before publication.
- An advanced JSON import/export tool restricted to validated backup/restore, not the primary workflow.

### Preview

Preview opens the real site in an Admin-only view using the in-memory draft returned by an authenticated endpoint. It cannot be indexed, cached publicly, or accessed with a copied unauthenticated URL. Desktop, tablet, and phone viewport controls are presentation aids only; the public components remain the same components used in production.

### Media library

The media library supports upload progress, thumbnail/poster, file metadata, alt text, copy URL, usage count, safe replacement, and deletion of unused files. Unsupported or oversized files fail before content is altered.

### Revisions

The revision screen shows publication time, operator, optional summary, and affected modules. `Restaurează ca draft` is explicit and reversible. It never publishes automatically.

## Public application migration

`useManagedContent` stops treating localStorage as authoritative. A top-level managed-content provider requests `/api/content`, validates/normalizes the payload, merges forward-compatible defaults, and supplies one stable snapshot to existing consumers.

Behavior:

- The checked-in defaults render immediately as a resilient fallback.
- A valid published payload replaces the fallback consistently across all consumers.
- Network failure does not blank the site or expose Admin errors.
- Malformed remote data is rejected and logged without partially applying it.
- The old localStorage key is read once only by an authenticated Admin migration action; public visitors never use it.
- Publishing updates the site on the next navigation or refresh without a build or deployment.

Components with hard-coded editable copy are migrated into the managed schema. Structural markup, accessibility labels whose wording is functional, route definitions, animations, and visual styling stay in code.

## Initial migration

The rollout is safe for the current public site:

1. Deploy the API and public content provider with checked-in defaults as fallback.
2. Run a protected idempotent bootstrap that stores the normalized defaults as both the first draft and first public revision.
3. Verify that the API snapshot renders the same public content as the current build.
4. Enable the new Admin session and editing UI.
5. Remove browser-local writes only after server draft and publication paths pass acceptance checks.
6. Keep JSON export available for operator-controlled backups.

Bootstrap cannot overwrite an existing publication unless an explicit force-migration operation is performed in a non-production environment.

## Vercel configuration

The repository provides the Vercel-compatible entrypoint, build configuration, rewrites, function limits, and security headers. The Vercel project must have these server-only values:

- `MONGODB_URI` from the MongoDB Atlas Marketplace integration.
- `DB_NAME`.
- `ADMIN_USERNAME`.
- `ADMIN_PASSWORD_HASH` marked sensitive.
- `ADMIN_SESSION_SECRET` marked sensitive.
- `BLOB_READ_WRITE_TOKEN` from Vercel Blob.
- Existing Google/Meta review credentials, when available.

No secret uses a `REACT_APP_*` prefix. Production, Preview, and Development have distinct database names or databases so preview edits cannot modify production content.

The Content Security Policy permits the exact Vercel Blob media origin and keeps arbitrary third-party media blocked. API requests are same-origin, so production does not depend on permissive CORS.

## Failure and concurrency behavior

- Autosave failure keeps the local draft dirty and offers retry; it never reports success optimistically.
- A `409` conflict stops autosave, preserves both versions, and offers reload or explicit merge rather than last-write-wins.
- Session expiry pauses mutations and asks for login again.
- Upload failure leaves existing content and media references untouched.
- Publish failure leaves the current public revision unchanged.
- Public API failure leaves the checked-in fallback visible.
- Database or Blob credentials missing in Production cause protected readiness checks to fail closed.
- A Blog, review, or quote subsystem failure does not prevent public site content from loading.

## Security and privacy

- All Admin mutations are server-authorized.
- Secrets stay in Vercel server environment variables.
- Session IDs are random, stored only as hashes in MongoDB, rotated on login, expired through TTL, and revoked on logout.
- CSRF protection, strict same-origin checks, secure cookies, request-size limits, structured validation, login throttling, and security logging apply to protected routes.
- Admin responses use `Cache-Control: no-store`.
- Raw HTML and JavaScript are rejected from managed rich-text fields; the first release uses structured plain text and safe links.
- Quote private notes and customer details never appear in public content responses.
- Logs exclude credentials, cookies, CSRF tokens, quote bodies, and database connection strings.

## Accessibility and responsive behavior

- Login and Admin controls are keyboard-operable with visible focus.
- Status is conveyed through text and ARIA live regions, not color alone.
- Dialogs trap focus and restore it on close.
- Destructive actions require a clear confirmation naming the affected item.
- The editor has no horizontal overflow at 1440×900, 1024×1366, 834×1194, 430×932, and 390×844.
- Mobile supports essential edits and publication; collection reordering also exposes buttons so it does not depend only on drag-and-drop.
- Reduced-motion preferences disable decorative transitions without hiding state changes.

## Verification contract

Implementation is test-first and includes:

### Backend

- Authentication success/failure, secure cookie attributes, logout, expiry, CSRF rejection, and distributed login throttling.
- Draft validation, autosave version increments, stale-version conflicts, and absence of partial writes.
- Atomic publish, immutable revision creation, publication summaries, and restore-to-draft behavior.
- Public endpoint returns only the active publication and honors `ETag` revalidation.
- Bootstrap is idempotent and refuses to overwrite existing production content.
- Media type/size validation, successful Blob metadata persistence, reference protection, and safe deletion.
- Blog protected routes use the global session.
- Quote list/detail/status/note authorization and validation.
- Secrets and private quote data never appear in public responses.

### Frontend

- Public provider falls back safely, applies one valid remote snapshot, rejects malformed data, and does not read browser-local content for visitors.
- Login, session restoration, logout, and expired-session behavior.
- Autosave debounce, saving/saved/error/conflict states, and prevention of publishing invalid or pending content.
- Preview uses draft data while normal routes use published data.
- Publish comparison, confirmation, success, failure, revision list, and restore-to-draft.
- Media upload failure preserves editor state.
- Blog no longer asks for or stores an Admin key.
- Quote dashboard filters and status updates.
- Keyboard, focus, touch-target, and reduced-motion behavior.

### Deployment and end-to-end

- Production frontend build and backend test suite pass.
- A Vercel build proves the CRA output and FastAPI function coexist and `/api/*` is not swallowed by the SPA fallback.
- Preview deployment passes health, login, draft autosave, preview, publish, public refresh, revision restore, media upload, Blog, and quote-request flows.
- Horizontal-overflow checks run at the approved desktop, tablet, and mobile viewports.
- A final production checklist verifies Vercel integrations, sensitive environment variables, separate preview data, custom domain, Blob CSP origin, monitoring, backup/export, and rollback.

## Rollout boundary

The feature requires one normal code deployment to install the CMS. After that deployment, editorial content changes require only Admin draft/save/publish operations.

The implementation does not provide arbitrary page-building, arbitrary CSS editing, multiple roles, public user accounts, comments, newsletters, translation workflows, or real-time collaborative editing. These are intentionally outside the first production release.

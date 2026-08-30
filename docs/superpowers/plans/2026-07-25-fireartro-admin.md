# FireArtRo Admin Implementation Plan

> **For agentic workers:** Implement each checked task in order and verify the complete flow at the end.

**Goal:** Build a visual local CMS for all regularly edited FireArtRo content, including image import.

**Architecture:** Field and module schemas describe the content model. A focused Admin page renders list and object editors from those schemas, while image utilities resize uploads before local persistence. Public consumers continue using the existing managed-content event and storage layer.

**Tech Stack:** React 19, React Router, Lucide, browser Canvas/FileReader, CSS.

## Global Constraints

- No new runtime dependencies.
- No fake authentication or claims of global publishing.
- Imported images must be compressed before persistence.
- Keep keyboard focus, labels, destructive confirmations, and mobile layouts accessible.

---

### Task 1: Content schemas and image processing

**Files:**
- Create: `frontend/src/admin/adminConfig.js`
- Create: `frontend/src/admin/imageUtils.js`

- [ ] Define every editable module, field, template, summary, and media target.
- [ ] Implement image validation, resizing, WebP encoding, and readable error messages.

### Task 2: Visual content manager

**Files:**
- Replace: `frontend/src/pages/AdminPage.jsx`
- Create: `frontend/src/admin.css`

- [ ] Build the app bar, module navigation, searchable item list, and field editor.
- [ ] Add create, duplicate, delete, reorder, save, reset, import/export, preview, and advanced JSON flows.
- [ ] Add responsive layouts and visible focus states.

### Task 3: Public content integration

**Files:**
- Modify: `frontend/src/components/site/Faq.jsx`
- Modify: `frontend/src/components/site/Footer.jsx`
- Modify: `frontend/src/components/site/Partners.jsx`
- Modify: `frontend/src/components/site/Packages.jsx`
- Modify: `frontend/src/components/site/QuoteForm.jsx`

- [ ] Read managed FAQ, company, social, partners, and packages where rendered.
- [ ] Render uploaded partner logos and package images when present.

### Task 4: Verification

- [ ] Run frontend lint/test command if configured.
- [ ] Run the production build.
- [ ] Exercise `/admin` at desktop and mobile sizes, including an image upload, save, and public-page reflection.
- [ ] Check console errors and horizontal overflow.

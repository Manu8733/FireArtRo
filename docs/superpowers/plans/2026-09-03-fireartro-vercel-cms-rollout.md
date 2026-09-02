# FireArtRo Vercel CMS Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap current content safely, verify the complete CMS, provision its Vercel resources, and release it with a tested rollback path.

**Architecture:** An authenticated idempotent bootstrap creates the first draft/public revision from checked-in defaults, then all editorial changes flow through Admin. Preview and production use separate Vercel environment targets and MongoDB databases; media uses a connected Blob store, and deployment validation proves the hybrid CRA/FastAPI routing before production promotion.

**Tech Stack:** Vercel CLI/Preview Deployments, MongoDB Atlas Marketplace, Vercel Blob, FastAPI, React/CRA, pytest, Jest, Playwright, PowerShell.

## Global Constraints

- Bootstrap cannot overwrite an existing publication.
- The first public API snapshot must render the same content as the checked-in fallback.
- Preview data must never modify Production data.
- Secrets are entered through Vercel sensitive environment variables and never committed or printed.
- One code deployment installs the CMS; later editorial publication requires no Git push or redeploy.
- Production promotion requires backend, frontend, Vercel-build, and browser acceptance evidence from the current revision.

**Cross-plan order:** Execute this plan only after the Foundation, Content Publishing, and Admin Operations completion gates pass.

---

## File structure

- `backend/tests/test_cms_bootstrap.py`: bootstrap validation and overwrite protection.
- `frontend/src/admin/AdminBootstrap.jsx`: submits the checked-in fallback exactly once from an authenticated session.
- `frontend/src/admin/AdminBootstrap.test.jsx`: bootstrap UI and payload safety.
- `frontend/src/admin/AdminMigrationPanel.jsx`: authenticated one-time local-data inspection/import.
- `frontend/src/admin/AdminMigrationPanel.test.jsx`: migration safety.
- `scripts/verify-vercel-cms.ps1`: environment-name, routing, and health verification without printing values.
- `frontend/e2e/admin-cms.spec.js`: complete editorial lifecycle.
- `frontend/e2e/public-content.spec.js`: public fallback/publication regression.
- `docs/runbooks/fireartro-cms-operations.md`: operator and recovery runbook.
- `docs/runbooks/fireartro-vercel-setup.md`: exact Vercel provisioning checklist.
- `scripts/hash_admin_password.py`: interactive bcrypt hash generator that never receives a password through shell arguments.

### Task 1: Bootstrap the checked-in fallback safely

**Files:**
- Create: `backend/tests/test_cms_bootstrap.py`
- Create: `frontend/src/admin/AdminBootstrap.jsx`
- Create: `frontend/src/admin/AdminBootstrap.test.jsx`
- Modify: `backend/cms_service.py`
- Modify: `backend/cms_routes.py`

**Interfaces:**
- Consumes: `ADMIN_DEFAULTS` sent from the authenticated Admin and validated as `SiteContent` by the server.
- Produces: protected, idempotent `POST /api/admin/content/bootstrap` plus the first draft/public revision.

- [ ] **Step 1: Write failing seed/bootstrap tests**

```python
async def test_bootstrap_is_idempotent_and_never_overwrites(cms_service, default_content):
    first = await cms_service.bootstrap(default_content, "admin")
    second = await cms_service.bootstrap({**default_content, "siteDetails": changed_site()}, "admin")
    assert second.revision_id == first.revision_id
    assert (await cms_service.get_publication()).content == first.content
```

Add tests proving an invalid payload returns `422`, anonymous/CSRF-less bootstrap is rejected, and a second request cannot alter either draft or publication.

- [ ] **Step 2: Run tests and verify missing seed failure**

Run: `python -m pytest backend/tests/test_cms_bootstrap.py -q`

Expected: FAIL because the bootstrap endpoint does not accept and validate an initial snapshot.

- [ ] **Step 3: Implement protected bootstrap input**

```python
@router.post("/api/admin/content/bootstrap", response_model=PublicationResponse)
async def bootstrap(
    request: BootstrapRequest,
    identity: AdminIdentity = Depends(require_admin_session),
):
    return await service.bootstrap(request.content, identity.id)
```

`BootstrapRequest.content` is typed as `SiteContent`. The service returns the existing publication unchanged when one exists.

- [ ] **Step 4: Add the authenticated first-run UI**

```jsx
const initialize = async () => {
  await request("/api/admin/content/bootstrap", {
    method: "POST",
    body: JSON.stringify({ content: ADMIN_DEFAULTS }),
  });
  await reloadDraft();
};
```

Show this action only when the API explicitly reports `not_initialized`. It names that current checked-in content will become the first public version and requires confirmation.

- [ ] **Step 5: Run bootstrap and CMS tests**

Run: `python -m pytest backend/tests/test_cms_bootstrap.py backend/tests/test_cms_service.py backend/tests/test_cms_routes.py -q`

Expected: PASS.

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminBootstrap.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit the initial seed path**

```bash
git add backend/cms_service.py backend/cms_routes.py backend/tests/test_cms_bootstrap.py frontend/src/admin/AdminBootstrap.jsx frontend/src/admin/AdminBootstrap.test.jsx
git commit -m "feat: add safe CMS bootstrap"
```

### Task 2: Provide one-time browser-local migration and remove public local publishing

**Files:**
- Create: `frontend/src/admin/AdminMigrationPanel.jsx`
- Create: `frontend/src/admin/AdminMigrationPanel.test.jsx`
- Modify: `frontend/src/hooks/useManagedContent.js`
- Modify: `frontend/src/pages/AdminPage.jsx`
- Modify: `frontend/src/pages/LegalPage.jsx`

**Interfaces:**
- Consumes: legacy key `fireartro-managed-content-v1` and the authenticated draft update API.
- Produces: `inspectLegacyContent()`, `mergeLegacyIntoDraft()`, and `clearLegacyContent()` restricted to Admin.

- [ ] **Step 1: Write failing migration tests**

```javascript
test("legacy content is never applied to public visitors", () => {
  localStorage.setItem("fireartro-managed-content-v1", JSON.stringify({ siteDetails: { name: "Local" } }));
  render(<ManagedContentProvider><BrandName /></ManagedContentProvider>);
  expect(screen.queryByText("Local")).not.toBeInTheDocument();
});


test("Admin imports only schema-valid legacy fields into draft", async () => {
  localStorage.setItem("fireartro-managed-content-v1", JSON.stringify(validLegacyContent));
  renderMigrationPanel();
  await user.click(screen.getByRole("button", { name: "Importă în draft" }));
  expect(updateDraft).toHaveBeenCalledWith(expect.objectContaining({ siteDetails: validLegacyContent.siteDetails }));
  expect(publish).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run tests and verify missing migration panel**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminMigrationPanel.test.jsx`

Expected: FAIL because the panel does not exist.

- [ ] **Step 3: Implement safe inspection/import**

The panel reports whether legacy data exists, its recognized modules, validation errors, and byte size. Import merges recognized fields into the current draft only after frontend validation and asks for confirmation. It never publishes or deletes local data automatically.

- [ ] **Step 4: Add explicit cleanup and update legal copy**

`Șterge datele locale vechi` removes only `fireartro-managed-content-v1` after naming the key in a confirmation dialog. Update the cookie policy so it no longer describes that key as the active Admin publishing mechanism.

- [ ] **Step 5: Run migration/public-provider tests and commit**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminMigrationPanel.test.jsx src/content/ManagedContentProvider.test.jsx`

Expected: PASS.

```bash
git add frontend/src/admin/AdminMigrationPanel.jsx frontend/src/admin/AdminMigrationPanel.test.jsx frontend/src/hooks/useManagedContent.js frontend/src/pages/AdminPage.jsx frontend/src/pages/LegalPage.jsx
git commit -m "feat: migrate legacy Admin drafts safely"
```

### Task 3: Add operational verification and recovery documentation

**Files:**
- Create: `scripts/verify-vercel-cms.ps1`
- Create: `scripts/hash_admin_password.py`
- Create: `docs/runbooks/fireartro-cms-operations.md`
- Create: `docs/runbooks/fireartro-vercel-setup.md`
- Modify: `backend/.env.example`
- Modify: `frontend/.env.example`

**Interfaces:**
- Consumes: a linked Vercel project and a target environment name.
- Produces: a non-secret pass/fail preflight plus exact operator/rollback procedures.

- [ ] **Step 1: Implement a non-secret environment preflight**

```powershell
param(
  [ValidateSet('development', 'preview', 'production')]
  [string]$Environment = 'preview'
)

$required = @(
  'MONGODB_URI', 'DB_NAME', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET', 'BLOB_READ_WRITE_TOKEN'
)
$listing = npx vercel@latest env ls $Environment 2>&1 | Out-String
$missing = $required | Where-Object { $listing -notmatch [regex]::Escape($_) }
if ($missing.Count) {
  Write-Error ("Missing Vercel variables: " + ($missing -join ', '))
  exit 1
}
Write-Output "Vercel CMS environment names are present for $Environment."
```

The script checks names only and never runs `vercel env pull`, echoes values, or prints tokens.

- [ ] **Step 2: Document exact Vercel provisioning**

The setup runbook contains this order:

1. Link the repository to the existing Vercel project.
2. Install MongoDB Atlas from Storage/Marketplace and attach Preview and Production.
3. Create one public Blob store and attach Preview and Production.
4. Set distinct `DB_NAME` values for Preview and Production.
5. Add `ADMIN_USERNAME`, bcrypt `ADMIN_PASSWORD_HASH`, and 32-byte-or-longer `ADMIN_SESSION_SECRET` as sensitive variables.
6. Preserve existing Google/Meta credentials only in Vercel server variables.
7. deploy Preview, run bootstrap once, and execute acceptance tests.
8. promote only the verified deployment.

- [ ] **Step 3: Add the interactive password-hash utility**

```python
from getpass import getpass
import bcrypt

password = getpass("Initial Admin password: ")
confirmation = getpass("Confirm Admin password: ")
if password != confirmation or len(password) < 14:
    raise SystemExit("Passwords must match and contain at least 14 characters.")
print(bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8"))
```

The plaintext password is never accepted as a command-line argument, written to disk, or printed.

- [ ] **Step 4: Document daily operations and recovery**

The operations runbook covers login, autosave states, preview, publish, revision restore, JSON export, media cleanup, quote triage, session expiry, rotating the Admin password/session secret, database backup, failed-publication behavior, and rollback to the prior Vercel deployment.

- [ ] **Step 5: Run the preflight script parser test**

Use Pester when available; otherwise invoke the script with a mocked `npx` executable in a temporary directory and assert missing names exit `1` while all names exit `0`. The test fixture contains only variable names and non-secret sentinel values.

- [ ] **Step 6: Commit runbooks and preflight**

```bash
git add scripts/verify-vercel-cms.ps1 scripts/hash_admin_password.py docs/runbooks/fireartro-cms-operations.md docs/runbooks/fireartro-vercel-setup.md backend/.env.example frontend/.env.example
git commit -m "docs: add CMS deployment and recovery runbooks"
```

### Task 4: Run full local regression and hybrid-build verification

**Files:**
- Create: `frontend/e2e/public-content.spec.js`
- Modify: `frontend/e2e/admin-cms.spec.js`

**Interfaces:**
- Consumes: completed foundation, publishing, and Admin-operations plans.
- Produces: one reproducible verification record for the release commit.

- [ ] **Step 1: Add public fallback and publication E2E coverage**

```javascript
test("public site survives API failure without local Admin leakage", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem(
    "fireartro-managed-content-v1",
    JSON.stringify({ siteDetails: { name: "Never public" } }),
  ));
  await page.route("**/api/content", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText("Never public")).toHaveCount(0);
  await expect(page.locator("main")).toBeVisible();
});
```

Add checks that Gallery, Packages, FAQ, Contact, Blog, and all legal routes consume one published revision.

- [ ] **Step 2: Run complete backend tests**

Run: `python -m pytest backend/tests -q`

Expected: PASS with no skipped CMS/auth/media/quote tests.

- [ ] **Step 3: Run complete frontend tests**

Run: `cd frontend && yarn test --watchAll=false`

Expected: PASS.

- [ ] **Step 4: Run production and Vercel builds**

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

Run: `npx vercel@latest build --yes`

Expected: static frontend and both required API functions build successfully.

- [ ] **Step 5: Run focused browser suites**

Run: `cd frontend && npx playwright test e2e/public-content.spec.js e2e/admin-cms.spec.js --project=desktop-chromium --project=tablet-webkit --project=mobile-chromium`

Expected: PASS with no horizontal overflow, failed screenshots, traces, or videos.

- [ ] **Step 6: Commit final regression coverage**

```bash
git add frontend/e2e/public-content.spec.js frontend/e2e/admin-cms.spec.js
git commit -m "test: cover complete CMS publication flow"
```

### Task 5: Provision Vercel Preview, validate, and promote Production

**Files:**
- No source-file changes unless Preview evidence reveals a defect; defects return to the owning plan/task and receive their own tested commit.

**Interfaces:**
- Consumes: linked Vercel project, Vercel Marketplace resources, sensitive credentials entered by the project owner or securely generated for them, and the verified release commit.
- Produces: a working Preview deployment followed by a promoted Production deployment.

- [ ] **Step 1: Link and audit the Vercel project**

Run: `npx vercel@latest link`

Run: `npx vercel@latest project inspect`

Expected: the linked project is the existing FireArtRo site and its Production branch is confirmed before any deployment.

- [ ] **Step 2: Provision storage from Vercel**

Install MongoDB Atlas and Vercel Blob from the project's Storage/Marketplace screen. Attach both resources to Preview and Production. Do not reuse the Production database name for Preview.

- [ ] **Step 3: Add sensitive Admin settings**

Generate the bcrypt hash locally without placing the plaintext password in shell history:

```powershell
python scripts/hash_admin_password.py
```

Enter the password only in the utility's hidden prompts, then add only the resulting hash with `npx vercel@59.11.2 env add ADMIN_PASSWORD_HASH preview --sensitive` and `npx vercel@59.11.2 env add ADMIN_PASSWORD_HASH production --sensitive`. Add separately generated 32-byte session secrets with the same explicit Preview and Production commands.

- [ ] **Step 4: Run environment-name preflight**

Run: `powershell -ExecutionPolicy Bypass -File scripts/verify-vercel-cms.ps1 -Environment preview`

Expected: PASS without printing any value.

- [ ] **Step 5: Deploy Preview and bootstrap**

Run: `npx vercel@latest`

Expected: Preview deployment succeeds. Sign in, call the one-time bootstrap action, verify the first public revision, and confirm the fallback/API snapshot parity.

- [ ] **Step 6: Run remote smoke and E2E tests**

Run: `cd frontend; $env:PLAYWRIGHT_BASE_URL = Read-Host 'Vercel Preview URL'; $env:PLAYWRIGHT_USE_EXISTING_SERVER='1'; npx playwright test e2e/public-content.spec.js e2e/admin-cms.spec.js --project=desktop-chromium --project=tablet-webkit --project=mobile-chromium`

Expected: PASS. The preview URL is supplied at runtime and not committed.

- [ ] **Step 7: Promote the verified deployment**

Run: `$verifiedPreviewUrl = Read-Host 'Verified Vercel Preview URL'; npx vercel@59.11.2 promote $verifiedPreviewUrl`

Expected: the exact tested deployment becomes Production; no rebuild with different source occurs.

- [ ] **Step 8: Run production smoke checks**

Verify `/`, `/galerie`, `/pachete`, `/intrebari-frecvente`, `/contact`, `/blog`, all three legal routes, `/admin`, `/api/health`, public content, Blog, reviews, quote submission, Admin login, draft autosave, preview, publish, revision restore, and Blob media.

- [ ] **Step 9: Record rollback target**

Record the immediately previous healthy Vercel deployment URL in the private deployment notes. If a launch-blocking defect appears, promote that known-good deployment and leave the new database revision intact for investigation; do not run `git reset --hard`.

## Rollout completion gate

The rollout is complete only when the first Production publication exists, the owner can edit a draft and publish without Git, Preview/Production data are separate, all required Vercel resource and environment names are present, remote browser flows pass, and a tested prior deployment is available for rollback.

# Validation

Baseline: main 9f13f48d77d214267279a027b698360a873e16c2.

## Current landing refinement

- scripts/check-landing.cjs passes DOM interaction checks for menu closure and
  focus, the eight-concept ribbon, hidden/inert duplicates, pause/resume,
  cow clearance at the jump apex, Escape cancellation, focus restoration,
  skip-once navigation, Back recovery, reduced motion and missing-image fallback.
- Five transparent WebP assets decode successfully. The card images are
  384 × 384 and the cow is 768 × 512. Generated subjects were visually inspected.
- Rendered layout, actual animation timing and mobile visual acceptance remain
  pending. DOM checks and computed arc geometry do not establish those results.

## Previous UX pass

- Sixteen automated tests pass, including duration validation, preserved
  historical methods/rounds, rolling boundaries and calendar arithmetic.
- scripts/check-records.cjs executes migration, review commitment, invalid
  edit rejection, valid edit, five changes nights, new-round creation,
  original-plan editing and reload against the complete inline application.
- The paper tracker now collects awake minutes; the updated A4 rendering was
  inspected with all columns and footer legible.
- The preceding art pass added exact-copy, local-link, CSS/URL and SVG checks
  in scripts/check-art.cjs, plus day-image readiness coverage.
- PR #9's previous illustrated deployment succeeded on Vercel. Rendered
  website/device acceptance is still pending.

## Earlier UX pass (historical record)

- All nine existing tests pass after updating the motion checks for sun geometry.
- A jsdom 26.1.0 integration check executes the complete inline app and verifies
  all five review steps, back/edit, choosing and committing a suggestion,
  tracker/report preview controls, Resources navigation and school empty state.
  Dialog methods are stubbed; this does not verify native focus trapping or layout.
  Re-run scripts/check-ux.cjs with jsdom available on NODE_PATH.
- HTML IDs are unique and all local asset links resolve. The three CSS files parse.
- The downloadable PDF is exactly one A4 page (595.28 x 841.89 points).
  Its 794 x 1123 rendering was visually inspected; table rules, headings, writing
  areas and footer fit without clipping. PyMuPDF rendered it because the bundled
  Poppler executable could not find its shared library.
- Actual updated motion smoothness, responsive screen layout and native dialog
  focus/print behavior still need browser/device acceptance. The previous
  deployed preview attempt required Vercel login; the Google sign-in route
  returned 502. No new live-browser pass is claimed.

## Earlier checks passed

- Node syntax parsing for both HTML files' inline scripts, landing.js and
  night-passage.js.
- Automated identity tests: stable opaque IDs, domain suffix attacks, missing
  identity, weak-key rejection, expected issuer/audience passed to Google's
  verifier, and verifier failures propagated. These use injected verifier
  fixtures; they are not real Google login tests.
- Results regression tests: current-round data isolated, history retained,
  three-night premature unlock rejected, committed review required.
- Motion tests: finite positions at 360, 390, 768 and 1440px; focused controls
  remain visible; reduced motion clears hidden states; short screens and failed
  images disable pinning. These are DOM-adapter tests, not rendered screenshots.
- Local server smoke test: health returned 200; site/API/config-file requests
  without a signed assertion returned 403 even with a forged email header.
- HTML ID uniqueness and local link/asset resolution on both pages and redirect.
- CSS stylesheet parsing with tinycss2.
- The four original WebP files decoded successfully with expected dimensions.
  The new tracker preview was generated directly from the inspected PDF.
- npm dependency lock generated and npm ci completed.

Run regression tests from the repository root:

    node --test tests/*.test.mjs google-server/test/*.test.mjs

## Not yet verified

- Rendered browser/device acceptance: the managed browser could not access the
  local preview (ERR_BLOCKED_BY_CLIENT). No screenshot or visual pass is claimed.
- Actual phone GPU smoothness, contrast measurements, keyboard walkthrough,
  200% text, print preview/PDF pagination and image-loading timing.
- The generated PR's Vercel deployment and visual preview.
- Docker image build and deployed Cloud Run/IAP behavior with real LAS accounts.
- Workbook access, schemas, write permissions and school record sync.

Keep the PR draft until the preview and A4 output are reviewed. Do not label
the school data pilot ready on the strength of unit tests or visual changes.

# Validation

Baseline: main 9f13f48d77d214267279a027b698360a873e16c2.

## Passed

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
- All four WebP files decoded successfully with expected dimensions.
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

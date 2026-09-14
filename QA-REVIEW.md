# QA review — 14 September 2026

This draft builds on PR #13's account-panel and mobile layout changes. Production remains the merged Apps Script repair from PR #12. The new class service requires manual deployment of Code.gs and Lab.html; it has not been exercised against the school's live Sheet.

## Verified

- Public production desktop browser at 1363 × 936: landing menu opens, toolkit link navigates, Sleep Lab entrance finishes; Entry/Calendar switching, calendar future-date blocking, entry-help dialog open/close, Results empty state, Resources, More help, How it works and day/night control respond. Read-only page measurements found no horizontal overflow on the checked results/help views. No real account or diary data was used.
- Local automated suites: 34 distinct tests (50 runner executions because shared backend test modules are imported by two suites). Covers record ownership, session revocation, conflict/retry handling, legacy time values, date arithmetic, flexible baseline, suggestions, startup diagnostics, motion geometry and new class authorization rules.
- DOM journeys: class creation and displayed code; student preview/confirm/join/leave; teacher-only tab. Existing connected sync/offline/delete/edit/logout, full review/print-preview/resources, flexible diary, Entry/Calendar/progress dots, and landing menu/entrance/reduced-motion checks pass.
- Static asset QA: unique HTML IDs, local links/assets, stylesheets parse, SVG XML and no embedded SVG scripts.
- Downloadable tracker regenerated and visually inspected as a one-page A4 PNG using PyMuPDF. Labels and table columns fit. PDF and website now use flexible phases and five-entry review wording.

## Fixed during this review

- Landing and introduction copy incorrectly said account saving was still being prepared or entries only stayed local. Copy now explains local versus connected storage.
- Landing, paper preview and downloadable tracker used fixed-week wording. Changed to phases with gaps permitted.
- Removed the unused whole-school summary renderer when adding the authenticated class workspace. New class routes never return diary metrics or student rosters.
- Teacher tab is hidden until the server confirms approval; keyboard navigation skips hidden tabs. New code inputs, date fields and action groups wrap at narrow widths, with 44px controls and 16px input text.
- Preserved PR #13's account status/action containment, narrow-screen stacking, dialog wrapping and chart legend wrapping.
- Updated two obsolete QA expectations: old group placeholder DOM and branding check accidentally scanning JavaScript configuration rather than visible copy.

## Still required before merging this draft

- Actual phone/tablet visual review: 360, 390, 768px; iOS Safari and Android Chrome; portrait/landscape; software keyboard open; long account email; day/night; enlarged text. Browser tooling here does not expose viewport resizing or mobile emulation. Motion tests exercise geometry across screen widths; DOM tests do not verify rendered CSS layout.
- Visual inspection of the NEW Teacher and Group views on a preview/Google deployment. Production desktop QA above does not validate unpublished styles.
- Live Apps Script pilot with two explicitly approved teachers and a separate school test account, including joining, leaving, code replacement, staff revocation, offline error/retry and comparison acceptance/revocation. Owner-only editor tests are not proof that student identity works under Workspace policy.
- Group summaries are intentionally unavailable. Implement explicit contribution choice, fixed study periods, eligible distinct-student counts, equal student weighting, suppression, approved rounded snapshots and withdrawal/deletion handling before enabling comparisons. Agree the retention period and class sizes with the school.

## Reproduce

From the repository root, with jsdom available on NODE_PATH:

```sh
node --test tests/*.test.mjs
node scripts/check-classes.mjs
node scripts/check-connected.mjs
node scripts/check-ux.cjs
node scripts/check-log-workspace.cjs
node scripts/check-flexible-diary.cjs
node scripts/check-landing.cjs
node scripts/check-art.cjs
node scripts/build-apps-script.mjs
```

No new Vercel environment variables or Cloud billing are needed.

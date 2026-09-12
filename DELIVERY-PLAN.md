> Sleep Lab update: [SLEEP-EVIDENCE-REVIEW.md](SLEEP-EVIDENCE-REVIEW.md) records the current flexible-diary behaviour, research limits and remaining work. Its phase terminology supersedes the fixed-week wording below for self-paced rounds.

# Shayne's Sleep Lab — design first, then one private Sheet

> Current ownership: an independent toolkit for Shayne's students, not LAS sponsored.
> The initial las.ch access policy is retained. Confirm the workbook and Cloud
> project owners; do not assume school ownership. GOOGLE-SETUP.md is the current
> connection walkthrough, and RESOURCE-ROADMAP.md covers later tools.

> Current refinement: see [PROJECT-REVIEW.md](PROJECT-REVIEW.md) for the source audit,
> implemented fixes and outstanding release blockers. [GOOGLE-SETUP.md](GOOGLE-SETUP.md)
> documents the optional IAP/Sheet connectivity foundation. These current-status
> documents take precedence over older implementation-status statements below.
> The design preview remains local-only; student record sync is not deployed.


Status: design implementation branch; Google connection and access enforcement are not deployed.
Local record update: new/uncommitted rounds use rolling-v1, beginning changes
with the morning after commitment; missed days can extend each phase.
Previously committed rounds keep fixed-calendar-v1. Historical entry labels
and estimates are retained. New/edited estimates use awake-minutes-v1.
This supersedes fixed-window and implicit waking-duration instructions below.
The same validation still needs implementation in the future record API.
Baseline reviewed: `main` at `6981425909df2f8fd2ca00b93c08e693d99c108a`.

## 1. Confirmed product decisions

This document is the implementation handoff for Codex. It supersedes conflicting
technical constraints in the earlier README and design brief. Preserve the core
baseline → review → intervention → results product, while correcting defects.

- Begin with the design; connect production services after the design is reviewable.
- School access is restricted to verified Google Workspace accounts in `las.ch`.
- One private Google spreadsheet will hold pilot records after ownership and access
  are confirmed and the record APIs are implemented.
- Each account has a stable opaque ID. Every entry and round belongs to that ID.
- Students may optionally join a staff-created class cohort with a short class code.
- Teacher and block are cohort labels shown after joining; students do not type free-form
  teacher names into every entry.
- Students retrieve their own data through the application, never by opening the source Sheet.
- The shared school view contains protected aggregates, never row-level records.
- No individual student Sheet links, additional student OAuth grants, or dual writes.
- A round belongs to one selected cohort or to personal mode. Changing cohorts never
  relabels earlier rounds.
- Keep a blank printable tracker, a populated personal report, CSV export, and digital history.
- Keep the other three toolkit topics as clearly secondary upcoming tools.
- No production authentication, Google Sheet, or infrastructure changes in the design PR.

The one-Sheet decision replaces the previous Firestore-first proposal for this
bounded pilot. Keep storage behind an interface so a later migration is possible,
but do not build a second persistent record system now.

**Terminology:** account IDs make source records pseudonymous, not anonymous.
An authenticated service can associate a person with an ID, and detailed records
may be identifying. Keep the entire workbook restricted. Hidden/protected tabs
are editing conveniences, not separate access-control boundaries.

## 2. Design implementation in this branch

The visual direction is a precise, calm editorial interface: navy and warm ivory,
expressive serif headlines, readable sans-serif controls, restrained monospace
metadata, fine rules and limited corner rounding. The fortnight graphic explains
the experiment; it does not fabricate sleep measurements. No reference image was
attached in this conversation.

Implemented:

- Rebuilt landing page with an immediate Enter Sleep Lab action and experiment overview.
- Return action changes to Continue my experiment when local entries exist.
- Upcoming tools moved out of the primary task area.
- Consistent day/night colours and persisted theme preference across both pages.
- Larger form controls, readable tabs with icons, toolkit backlink and skip link.
- Five visible mobile navigation options rather than a hidden horizontal tab scroller.
- Direct `#log`, `#learn`, `#results`, `#class`, `#help` entry routes.
- Roving tab focus with arrow, Home and End keyboard navigation.
- Logging actions at the top of the guide; print personalisation in a disclosure.
- Live save-status messages, restrained transitions, and reduced-motion overrides.
- Printable current-round personal record in addition to the existing blank tracker.
- Honest local-save wording; school-insights empty state does not claim that stripping names guarantees anonymity.

The endpoint remains blank. The existing timing and sync defects are not solved
by this visual pass. Do not label this branch school-ready.

## 2a. Class cohorts and generated codes

Class tracking is opt-in and secondary to the personal record. A staff member
creates a cohort in the counselling/admin workflow, chooses the teacher label and
block label, and receives a random code such as `N7K4-QP2M`. The code is a
credential for joining that cohort; it is not an identity and must not encode the
teacher, room, year group or student.

- Students see **Join a class study** once, before starting or committing a round.
- After validation, the UI confirms the teacher and block label so a student can
  catch a wrong code. Personal mode remains available without a code.
- Codes are generated server-side with sufficient entropy, can expire or be
  revoked, and have a staff-visible creation/last-used audit trail. Do not create
  codes from predictable class names or expose an unprotected code generator.
- A student may change cohort only with explicit confirmation. Earlier rounds and
  entries retain their original cohort.
- Teacher/block labels live on the cohort record, not on every night. Keep only the
  minimum staff-approved label needed for a report.
- Do not show a class report until it meets the distinct-student threshold. A small
  class sees `withheld`, not a near-empty chart. Never reveal whether a named
  student joined a code.
- Joining a cohort is participation in a reporting group, not blanket consent to
  every future use. Show the collection purpose and withdrawal/deletion route.

### Workbook additions for cohorts

Add a `Cohorts` tab with `cohort_id`, an opaque join-code representation,
teacher_label, block_label, study settings, created/revoked/expiry timestamps and
the staff owner. Add `cohort_id` to `Rounds` and `Entries`; do not copy teacher
names or block text into each entry. Students may resolve one code and attach it to
their own current round, but cannot list cohorts, enumerate codes, change labels,
or query membership.

## 3. Design acceptance before merging

Inspect 360px, 390px, 768px and 1440px in both themes. Include 200% text enlargement.
Use at least one actual school phone and a desktop browser. This branch has static
validation; browser and printed-page visual acceptance must still be performed.

- Homepage clearly explains the tool, and its primary button immediately opens logging.
- Returning users reach their current task without traversing the guide.
- Main body text is at least 16px; frequent labels about 14px; metadata at least 12px.
- Normal text meets 4.5:1 contrast, including buttons and chart labels.
- Interactive targets are generally at least 44px. Visible focus is never clipped.
- Tabs remain understandable at narrow widths; table scrolling stays within a labelled region.
- Check empty log, partly complete baseline, review, intervention, results, and second round.
- Review answer changes preserve keyboard focus; fix any focus loss from replacing dynamic HTML.
- Interactions use approximately 160ms feedback and 280ms page changes. Intro motion is finite.
- No looping background animation, scroll hijacking, or essential content hidden until animation finishes.
- Reduced-motion mode removes nonessential movement, including scripted smooth scrolling.
- Print blank tracker and populated report to A4 in black and white. Check long names,
  all 14 nights, empty records, page breaks, repeated table headings and handwriting space.
- The current report focuses on the current round; add a past-round selector before a multi-round pilot.
- No console errors, broken buttons, missing assets, or false sign-in/sync states.

## 4. Phase two — fix records and experiment rules

Complete this before using real school data. Add focused regression tests for
these cases; cosmetic components do not need implementation-mirroring tests.

### Experiment boundaries

Choose an explicit mode per study; do not infer intervention purely from entry count.

- Fixed class study: seven scheduled baseline mornings and seven intervention mornings.
  Review can become available after five baseline entries, but committing records
  a plan for the scheduled intervention start; the CTA states that start date.
- Rolling study: baseline starts at the first valid morning. After enough baseline
  entries, the student chooses a future intervention start morning. Save that date
  explicitly; do not retrospectively classify earlier nights as intervention.
- Insufficient baseline after the fixed window: offer accurate back-entry of a known
  missed night or a new round. Never encourage invented data or leave an unexplained gate.
- A missed morning is missing data, not zero sleep. Reject future log dates.
- Store round boundaries on the server and preserve them across devices.
- Use a consistent configured threshold for review and final results. Distinguish
  partial previews from final comparisons rather than showing three- and five-night rules.
- Results and recommendations operate on one selected round. Historical rounds remain selectable.
- Use local study dates in Europe/Zurich consistently; test midnight and daylight-saving boundaries.

### Entry quality

- Store waking date, lights-out time, out-of-bed time, latency, approximate minutes
  awake during the night, and an explicitly labelled morning/day rating.
- Replace the implicit 12-minute-per-waking deduction with a reported duration or
  clearly retain/label legacy estimates during migration. Version the calculation.
- Server validates real calendar dates, time format, sensible ranges, round ownership,
  selected-tool IDs and rating bounds. Recompute derived metrics server-side.
- Provide an Edit action that loads the original values and confirms an update.
- Preserve each checked strategy ID per night, not only a count.
- Treat recommendations as suggestions, not diagnoses. School health staff review
  the educational claims and illustrative sleep-pressure model before release.

### Local and network states

Use an account-specific local store after authentication. Before attaching an
existing anonymous local log, ask the signed-in user to confirm ownership.
Never silently attach one person's browser data to another person's account.

Persist pending mutations before sending. Use stable operation IDs, record
versions and explicit outcomes. Retry with bounded backoff. A repeated operation
must not create a second night. Surface conflicts instead of silently overwriting.

Deletion needs a pending tombstone until acknowledged, then removal from personal
views and future aggregates. An offline delete must not be resurrected by a pull.
Distinguish clearing this device, deleting a round, and deleting the account's records.
Do not claim records are synced until the server confirms the write.

On shared devices, default to session-only personal caching. Explain the trade-off
and offer trusted-device persistence. Sign-out clears the account's displayed data
and handles unsent work explicitly. Browser storage cannot promise that data is
never lost if the browser clears it; provide backup/export and accurate status.

## 5. Phase three — Google Cloud and one Sheet

Recommended pilot deployment: conventional frontend and same-origin API on Cloud
Run, protected by IAP, with server-only access to the Google Sheets API. Keep the
existing static frontend until a framework is justified. Cloud Run hosting does
not require a frontend framework or change the visual design.

The legacy Apps Script code is not the production transport. Do not expose personal
records through JSONP or place an executable endpoint/credential in the browser.
Apps Script may later support staff-only spreadsheet maintenance if needed.

### School-owned configuration

LAS technical owner supplies/configures:

- A Google Cloud project under the school organisation, billing and budget alerts.
- A selected region and confirmation of applicable school data-handling requirements.
- Cloud Run, IAP and Sheets API access.
- IAP access restricted to the LAS domain or an approved LAS pilot group.
- A dedicated runtime identity with access only to the pilot workbook, not broad Drive access.
- Deployment permissions and a rollback owner.
- Secret Manager for the ID derivation key and any other server secrets.
- Environment values: expected IAP audience, allowed domain `las.ch`, spreadsheet ID,
  timezone, study settings, privacy settings and retention policy.

The existing Sheet was supplied in the conversation. Set its ID as a server
configuration value after verifying school ownership and the runtime identity's
access. Do not publish the Sheet or copy its contents into the public repository.

### Identity and account IDs

Validate the signed `x-goog-iap-jwt-assertion`, including signature, issuer,
audience and expiry, using the official library. Verify hosted domain `las.ch`.
Reject missing or invalid identity; do not trust unsigned identity headers.

Derive a non-guessable stable account ID server-side, for example a versioned
HMAC-SHA256 over the verified issuer plus subject using a school-held secret.
This avoids storing names or email addresses in the Entries tab and avoids a
separate identity-mapping sheet. Do not use a plain hash of an email address.
Keep the derivation key stable and backed up; rotation requires an explicit ID
migration plan. Never silently replace it and strand existing records.

Every request derives ownership from the verified session. Ignore/reject a
client-supplied account ID. Knowing an ID never grants access. Names for print
may remain local or come from the current session; do not add them to logs.

### Workbook structure

One workbook, with clearly versioned tabs:

| Tab | Key | Fields / purpose |
| --- | --- | --- |
| Cohorts | cohort_id | opaque code representation, teacher/block labels, study settings, created/revoked/expiry, owner |
| Participants | account_id | schema version, participation agreement version/time, created_at; no name/email needed |
| Rounds | account_id + round_id | cohort_id (nullable), baseline start/end, intervention start/end, mode, answers, selected strategy IDs, status, version |
| Entries | account_id + round_id + waking_date | cohort_id snapshot, entry_id, raw log values, derived values, calculation version, strategy IDs completed, created_at, updated_at, version, deletion state |
| Operations | account_id + operation_id | mutation outcome/version and retry deduplication; short documented retention |
| SummarySnapshots | snapshot_id | approved aggregate payload, generated_at, cohort/time definition, reporting version |
| Settings | key | non-secret study/report settings and schema version; server validates these values |

Do not treat row numbers as record IDs. Do not allow staff to sort/edit the live
write tables while the service is operating; use filter views and approved exports.
Write user input as literal values, never spreadsheet formulas.

### Storage API contract

| Endpoint | Behaviour |
| --- | --- |
| GET /api/me | Minimal current identity/display info, participation state, configuration and sync state |
| GET /api/rounds | Only this account's complete round definitions |
| GET /api/entries?round=... | Only this account's entries, versions and deletion updates |
| POST /api/cohorts/resolve | Validate one staff-created code for the signed-in account; never list codes |
| POST /api/rounds/:roundId/cohort | Attach a validated cohort to a new/current round with explicit confirmation |
| POST /api/rounds | Create/commit a round owned by this account |
| PUT /api/entries/:entryId | Validated idempotent create/update with expected version |
| DELETE /api/entries/:entryId | Idempotent deletion with ownership and version checks |
| DELETE /api/me/records | Confirmed account-wide record deletion, including derived-report handling |
| GET /api/school-summary | Only a published protected aggregate snapshot |

Use same-origin mutation requests with CSRF protection and a restrictive CORS
policy. Do not accept raw SQL, Sheet ranges, spreadsheet IDs or arbitrary file URLs
from students. Personal responses must not enter shared caches. Logs omit record
payloads, email addresses, auth headers and secrets.

### Concurrency is a release gate

Sheets has no built-in row-level authorisation or application record uniqueness.
Implement those in the backend. A per-process JavaScript mutex is insufficient
when more than one server instance or deployment revision is running.

Before deployment, choose and document one tested write-serialisation design for
the workbook. A durable queue with a single coordinated writer is a candidate;
Cloud Tasks can provide delivery and rate control, but duplicate delivery and
worker timeouts still require durable deduplication and version checks. Do not
mistake a queue's concurrency setting for a database transaction.

Persist the mutation and its deduplication outcome atomically where supported.
Reads, retries, conflicting edits and deletes must have deterministic outcomes.
If the selected Sheet-only mechanism cannot pass the concurrency tests, stop the
connection release and explain the unresolved risk; do not silently add Firestore
or claim reliable syncing. Keep the design branch usable locally.

## 6. School summaries

The private pseudonymous dataset is never presented as a public anonymous pile.
All school members see only the approved report, not the workbook or raw entries.

- Compute within-student, within-round changes before aggregating. Do not weight
  a frequent logger more heavily simply because they provided more rows.
- Require a policy-approved minimum of distinct students in every released cohort
  and subgroup. Five is a starting review threshold, not an anonymity guarantee.
- Count people for weekday and strategy subgroups, not just nights.
- Avoid arbitrary filters, narrow date windows, combinations of small groups, and
  complementary totals from which hidden values can be recovered.
- Suppressed values are labelled withheld, not rendered as zero.
- Publish fixed delayed snapshots. A save must not force immediate regeneration.
- Small pilot may legitimately show no group data. Never lower thresholds for appearance.
- Publish dates, eligible participant counts where safe, missingness and limitations.
- Individual IDs, rare timestamps and individual trajectories are not returned.
- Deletion invalidates affected snapshots; withhold until safely rebuilt. Historical
  exports/backups follow the documented retention/deletion policy.

## 7. Verification and delivery slices

### PR A — design first (this branch)

Static frontend, local records, motion, navigation, printable personal report,
updated design brief and this handoff. No production Google changes. Complete
visual and print acceptance before calling the design finished.

### PR B — local record correctness

Explicit rounds/dates, consistent result gates, entry edit/validation, calculation
versioning, account-ready storage adapter and migration tests. Include a seeded
synthetic scenario for each stage without shipping fake student records by default.

### PR C — school identity and storage

Cloud Run deployment configuration, IAP validation, server-owned account IDs,
Sheet schema, serialised/idempotent mutations, retry/conflict UI, and migration.
Add a template of environment variable names only; never commit credentials.
Keep all Google reads/writes behind the storage adapter.

### PR D — summaries and pilot

Protected snapshot generation, staff runbook, regression tests, real school
account acceptance, measured mobile performance and print sign-off.

Mandatory end-to-end cases:

1. LAS student A can create/read/edit/delete their record; LAS student B cannot access it.
2. Personal Google account, outside-domain account and missing/forged IAP assertion are rejected.
3. Changing the URL, account_id or round_id never changes ownership.
4. Two devices restore all round metadata and agree after edits; stale versions produce a conflict.
5. Duplicate retries, simultaneous same-date writes and a worker timeout do not duplicate or lose records.
6. Offline writes/deletes survive a supported reload and sync with honest status.
7. Switching accounts never exposes or imports another account's local log.
8. Five-of-seven baseline, four-of-seven baseline, late review and later rounds have defined outcomes.
9. One person with many entries never meets a distinct-student subgroup threshold.
10. Small/overlapping cohorts, repeated refreshes and deletion cannot reveal an individual contribution.
11. School API payload contains no personal IDs or source records.
12. Print blank, partial and completed rounds in both themes; verify grayscale output.
13. Restrict or retire the existing public production deployment when moving to school-only access.
14. A valid code joins the intended cohort; an expired, revoked, malformed or guessed code does not.
15. Students cannot discover codes, list members, edit teacher/block labels, or move old rounds by changing a code.
16. A student can log without a code, and can join a cohort later without losing personal history.
17. Cohort reports with fewer than the distinct-student threshold are withheld.

## 8. Operational handoff and release

Counselling and LAS IT agree collection purpose, participant information, staff
access, retention, withdrawal/deletion process and who supports the pilot. Domain
membership is an access rule, not consent to any possible use of records.

Rehearse deployment with synthetic records first. Inspect existing Sheet headers
and data before any schema migration. Back up authorised existing data through
school-controlled storage; do not overwrite it blindly.

Release only after the school access, ownership, concurrency, privacy and print
gates pass. Keep a rollback to the last good deployment while retaining IAP,
queued records and compatible schema. For a data incident, disable affected writes
or summaries without removing authentication. A public local-only page is not an
automatic rollback for a school-only deployment.

Pilot success measures: logging completion, review completion, support incidents,
sync failures, access errors and student usability feedback. Do not interpret an
uncontrolled before/after difference as proof of an intervention's effect.

## 9. Primary implementation references

- Cloud Run / IAP: https://docs.cloud.google.com/iap/docs/enabling-cloud-run
- Signed identity and stable subject: https://docs.cloud.google.com/iap/docs/signed-headers-howto
- Sheets API limits: https://developers.google.com/workspace/sheets/api/limits
- Sheets batch updates: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate
- Queue controls: https://docs.cloud.google.com/tasks/docs/configuring-queues
- JSONP restriction: https://developers.google.com/apps-script/guides/content

Check current school policy and current official documentation during deployment.

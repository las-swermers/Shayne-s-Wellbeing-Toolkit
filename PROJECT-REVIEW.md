# Shayne's Wellbeing Toolkit — review and refinement

Reviewed baseline: main at 9f13f48d77d214267279a027b698360a873e16c2.
This is a source and asset review. It is not a production security certification
or a claim that every device has passed visual acceptance.

## September refinement update

The latest pass keeps the approved visual direction, replaces the ambiguous hero
with a toolkit-focused introduction, and moves the cow jump to Sleep Lab entry.
The latest art pass replaces the original textured scene with paired geometric
day/night alpine illustrations. Outlined cloud layers, an original vector cow,
line icons and flatter shared form tokens extend the user's visual references
through the toolkit. Public copy and PDF branding now identify Shayne's independent
toolkit. Initial las.ch access remains a separate policy, not sponsorship.

The exact requested hero copy is implemented. GOOGLE-SETUP.md now distinguishes
whole-site IAP from a public landing page with a separate sign-in entry, and covers
personal versus organization-owned Cloud projects. RESOURCE-ROADMAP.md stages the
future feelings, values, roommate, study and guided-pause activities.

The Lab now puts the core task first: a three-step overview, side-by-side log
workspace on larger screens, a one-question review, and a comparison/chart
workspace with history on demand. Small screens and enlarged text retain natural
scrolling; there is no fixed-height clipping or promise of zero scrolling.

A new one-page A4 PDF has been generated and visually inspected. Analog controls
open an in-page preview and offer a real PDF download. Personal results have
a preview before the existing print / Save as PDF flow.

Resources link each suggestion to CDC or NHLBI guidance, include a contextual
summary of the de Bruin et al. adolescent trial, and distinguish general
habits, adapted CBT-I principles, and an optional journaling idea. Unverified
claims and guaranteed outcomes were removed. This is not a systematic evidence
review or a validated CBT-I programme. Adolescent clinical review is still needed.
New and explicitly edited entries now use reported awake minutes with
calculationVersion=awake-minutes-v1. Stored historical values remain unchanged
and are labelled legacy-wakings-12; results disclose mixed methods. CSV carries
the version, awake minutes, round and selected strategy IDs.

New/uncommitted rounds use rolling-v1: baseline continues until the student
commits their changes, and the first changes-night ends the following morning
(after any already logged morning). Missed days do not create an artificial
deadline. Previously committed rounds retain fixed-calendar-v1 and their
original labels. Existing entry phase/ownership is never restamped on edit.
History now offers Edit, validates duration totals, and uses the original
round's plan. Paper and digital trackers both collect awake minutes.

Roommate Treaty is renamed Roommate Agreement. Its shared account workflow
remains future work; no roommate responses or emails are collected.

The finding table below describes the initial PR pass; where it refers to the
cow on scroll or an always-night scene, this update supersedes that description.

## What we are building

A school wellbeing toolkit with a cinematic alpine entrance and a practical,
calm daily working surface. Sleep Lab is the first real tool: baseline logging,
review, selected changes, comparison, printable tracker and personal report.
Roommate Agreement, First Weeks Away and Exam Nerves remain upcoming.

The reference contributes near-black space, precise centered typography,
luminous edges and deliberate pacing. The original identity remains the
moonlit mountain scene, playful cow, moving clouds and simple toolkit icons.
The reference's branding, template code, sales claims and testimonials are not used.

The intended entrance is a continuous scroll sequence:
1. A clear title and direct Sleep Lab action above the alpine landscape.
2. The copy withdraws as the cow follows an arc over the actual moon.
3. Two cloud layers move inward and upward at different speeds.
4. The scene resolves into the toolkit. Direct links remain available.
5. Entering the Lab uses a brief cloud transition; daily tasks stay immediate.

## What the existing project gets right

- Real baseline → review → intervention → results functionality exists.
- Plain HTML, CSS and JavaScript keep the build understandable.
- The visual system now shares Manrope, dark neutral surfaces and cool accents.
- A separate cow and clouds support coordinated motion.
- Local logging, CSV, blank tracker and populated personal printing exist.
- Direct section links, keyboard tab navigation and focus restoration in the
  review already exist; the review focus fix is preserved.
- Backend planning correctly moved toward one private school Sheet with opaque
  account IDs and optional staff-created class codes.

## Findings, decisions and disposition

| Priority | Finding at baseline | Change / status |
| --- | --- | --- |
| High | Hero and pinned passage repeat the same landscape, breaking continuity | Replaced with one sticky journey and one landscape |
| High | Cow follows viewport percentages, so the leap drifts relative to the cropped moon | Arc now derives from source-image moon coordinates and cover geometry |
| High | Decorative motion dominates without a reliable fallback | Static readable scene for reduced motion, short screens, image failure and no JavaScript |
| High | Faded controls can remain keyboard targets | Hidden intro/cue become inert; focused intro links stay visible |
| High | Lab reveal CSS hides content before observer success | Visible by default; animation applies only after intersection |
| High | Comparison combines different rounds and uses three-night gates despite five-night configuration | Current-round comparison and chart; configured thresholds plus committed review required |
| High | Future mornings can be logged and the next-date shortcut advances into the future | Future-date guard and a capped next-date value |
| Medium | Delete-all has no confirmation in local mode | Confirmation added; export remains available first |
| Medium | Selected strategy IDs are reduced to a count | New entries also retain strategy IDs and a legacy calculation-version marker |
| Medium | Large PNG delivery and preload targets the unused background | Four WebP delivery assets; preload points to displayed landscape; sheep loads lazily |
| Medium | Landing cinematic section is not covered by print rules | Art, clouds, scrolling height and sticky positioning removed for print |
| Medium | Second navigation can bypass a pending cloud transition | Repeated click is prevented while a destination is pending |
| Medium | Lab controls and cards have inconsistent shapes and density | Scoped polish stylesheet unifies tabs, input controls, spacing, feedback and cards |
| Medium | Unused serif font is still downloaded | Removed unused font request |
| Medium | Documentation describes earlier visual revisions as current | Current precedence and links added to the brief, README and delivery plan |

## Visual limits that still require review

The mountain ridges and moon remain part of one illustration. This PR does not
claim independent 3D terrain or separate ridge parallax. Clouds and cow are
independent. Additional ridge artwork should only be commissioned if the
reviewed composition needs it.

The tool dock now uses four small illustrated alpine scenes instead of unrelated
glyph styles. The Sleep Lab transition puts cream clouds behind the moon and
outlined cow, preserving the jump's readability. Their silhouettes, text
contrast and cloud composition still need review at actual phone scale.

The earlier assistant's live-view attempts did not establish a successful
render of the site: GitHub Pages returned a missing-site page and the Vercel
browser connection failed. That earlier positive assessment was based on code,
not a completed visual walkthrough. This review records that limitation.

## Functional and data release blockers

These are separate from visual finish and must be resolved before real student
records are synced.

1. **Phase timing:** the local rolling timeline and preserved historical labels
   are implemented. The future record API must validate and persist these same
   boundaries; old committed calendar rounds remain explicitly labelled.
2. **Sleep estimates:** reported awake minutes, versioned historical labels and
   consistent paper/CSV fields are implemented locally. The future server must
   recompute the versioned formula and reject impossible duration totals.
3. **Account ownership:** the current local store is shared by users of the
   browser. The legacy merge automatically attaches it to whoever signs in.
   Replace this with per-account storage and an explicit import confirmation.
4. **Reliable mutations:** legacy deletes have no durable tombstone and can be
   resurrected by a later pull. Round writes, edits, retries and conflicts need
   acknowledged operation IDs and server versions, not best-effort callbacks.
5. **Concurrency:** a Sheet is not a transactional database. A single-instance
   setting alone is not a sufficient correctness guarantee during deployments.
   Select a serialized writer or durable coordination design before adding
   student writes; test retries and concurrent edits.
6. **Identity/data transport:** keep the legacy ENDPOINT blank. Personal records
   must use the verified server session and same-origin JSON. Never accept
   an account ID, role or domain supplied by the browser as authority.
7. **Group privacy:** opaque IDs make source records pseudonymous. Aggregation
   needs distinct-student thresholds for every output, suppressed complements,
   limited filters and fixed release windows. Counting observations per bar
   alone does not establish anonymity. Do not expose live membership counts.
8. **Class codes:** server-created codes, expiry/revocation, label confirmation
   and round-bound membership still need implementation. Teacher/block labels
   belong to a cohort; codes do not grant staff access.
9. **History:** edits now preserve the original round/phase and use its plan;
   current-round charts, copied summaries and reports align. A deliberate
   past-round comparison selector remains future work.
10. **Operations/content:** school owners must confirm retention, deletion,
    support ownership, participation wording and educational recommendation
    wording. The tool must not present its suggestions as diagnoses.

## Google foundation included

The optional Cloud Run container validates signed IAP assertions, limits the
verified identity to las.ch, derives stable opaque account IDs and offers a
read-only check of the configured Sheet's metadata. It serves only an explicit
allowlist of public application assets.

It does not read student rows, write records, implement cohorts, publish group
aggregates or turn the existing page's legacy sync on. Session responses explicitly
report recordSync:false. No simulated login is added to the public preview.

See GOOGLE-SETUP.md for the exact configuration and verification sequence.
Production setup needs an authorized project owner, a runtime identity with Sheet
access, the deployed audience and a stable secret in Secret Manager.

## Acceptance record

Automated: JavaScript syntax, HTML local asset resolution, CSS parse checks,
identity boundary tests, current-round comparison regression and motion fallback
checks are recorded in VALIDATION.md with their actual outcomes.

Pending human/device acceptance: 360, 390, 768 and 1440px, both themes, keyboard
navigation, 200% text enlargement, reduced motion, slow image loading, Back and
modified-click behavior, A4 blank tracker and populated personal report.

Review the new PR preview before merging. Production school sign-in and data
collection remain a separate deployment gate after the design is accepted.

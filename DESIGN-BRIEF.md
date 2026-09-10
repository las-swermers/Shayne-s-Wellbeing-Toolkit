# Design brief — LAS wellbeing toolkit

> Current refinement: see [PROJECT-REVIEW.md](PROJECT-REVIEW.md) for the source audit,
> implemented fixes and outstanding release blockers. [GOOGLE-SETUP.md](GOOGLE-SETUP.md)
> documents the optional IAP/Sheet connectivity foundation. These current-status
> documents take precedence over older implementation-status statements below.
> The design preview remains local-only; student record sync is not deployed.


This brief reflects the current user request: high-end visual design and purposeful
motion, a sleek informational landing page, a clear entrance to the working tool,
and both printable and digital records. It supersedes the previous skin-only brief.

## Product surface

- `index.html`: informational landing page, immediate entry to Sleep Lab, concise
  explanation of the experiment, upcoming tools clearly secondary.
- `sleep-lab.html`: daily logging, review, personal results, school summaries and help.
- One private school Sheet with stable account IDs is the agreed next-phase data
  model. See `DELIVERY-PLAN.md`. No per-student Sheet connection flow is needed.
- Optional class studies use staff-generated cohort codes. Teacher and block are
  confirmed labels after joining; they are not free-text fields repeated on each log.

## Visual direction

Keep the original alpine world: mountains, moonlight, clouds, the cow above the
moon, and playful tool icons. Use the user-supplied cinematic reference
(https://t3code-cinematic-dark-saas-landing-page-template-v2.21st.app/) for
presentation: near-black space, centered sans-serif type, restrained luminous
edges, compact controls and carefully timed motion. Do not import the template's
copy, testimonials, brand, or code.

The hero introduces the whole toolkit. The alpine scene beneath it introduces
Sleep Lab. A compact dock uses a sculpted sheep for sleep, a bunk-bed icon for
Roommate Treaty, and restrained symbols for the other tools. Upcoming tools must
be clearly marked and never masquerade as working links. Retain functional day
and night themes.

The September 10 pass replaces the earlier duplicated/hidden landing layout.
It uses one original mountain/moon/cow illustration and independently moving
transparent cloud layers. The mountain ridges and cow are still part of the
static illustration; independently animated ridges and cow are future asset
work, not a capability to claim in this pass.

Graphics should explain the experiment and results. The fourteen-day figure is
an overview, never fabricated performance data. Keep exact charts in SVG or a
charting library; never use generated imagery for numeric evidence.

## Interaction

- About 160ms for button feedback; 280ms for panel transitions.
- Introductory entrance motion is brief, finite and does not delay interaction.
- The landing page may use restrained parallax and reveal motion: the mountain
  scene shifts slightly with scroll, clouds move at two depths, and entering
  Sleep Lab passes through a short cloud threshold. No scroll
  hijacking, autoplay video or continuous decorative motion.
- Respect reduced-motion preferences in CSS and JavaScript.
- Keep normal modified-click/new-tab navigation. Skip the passage if its image
  is unavailable. Escape cancels a pending passage; returning with browser Back
  clears its overlay. No-JavaScript content and links remain usable.
- Consistent pressed, focus, selected, disabled, empty and error states.
- Save confirmation is precise: saved locally, waiting, syncing or confirmed.
- Class membership is an optional, explicit step labelled **Join a class study**;
  students can always remain in personal mode.
- A valid code returns the teacher/block label before the student confirms. Invalid,
  expired and revoked codes get a plain error without revealing whether a code exists.
- All five navigation options remain discoverable on a small phone.
- Direct section links work. Existing users can continue their record.

## Accessibility and print

Use at least 16px body text, around 14px for regular labels and at least 12px
metadata. Check contrast at 4.5:1 for normal text. Provide visible keyboard focus,
semantic labels, live status feedback and sufficiently large touch targets.
Test 360, 390, 768 and 1440px widths and 200% text enlargement. Tables may scroll
inside a labelled region; the page itself must not overflow.

Deliver a blank A4 tracking sheet with handwriting space and a populated personal
report. Check both in black and white with long names, partial logs and complete
rounds. Print styling is independent of the selected screen theme. Do not print
navigation, hidden actions or destructive controls.

## Implementation constraints

Preserve local records and existing functions during the design pass. Keep plain
HTML/CSS/JS for this phase; scoped shared styles and scripts are appropriate.
No framework migration is needed to
improve the appearance. Preserve the runtime chart colour tokens. Correct
interaction defects where necessary, but explicitly document changes to the
experiment and data model in a separate implementation slice.

Production authentication and Google connection follow the design phase. Do not
present a simulated sign-in as real or put student records into a public preview.
The previous requirement to preserve JSONP does not apply to future integration.

## Review

The implementation branch includes static validation. Visual browser acceptance,
actual-phone checks and A4 print inspection remain required before design sign-off.
See the delivery plan for the exact acceptance cases and remaining backend defects.

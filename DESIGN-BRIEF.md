# Design brief — LAS wellbeing toolkit

This brief reflects the current user request: high-end visual design and purposeful
motion, a sleek informational landing page, a clear entrance to the working tool,
and both printable and digital records. It supersedes the previous skin-only brief.

## Product surface

- `index.html`: informational landing page, immediate entry to Sleep Lab, concise
  explanation of the experiment, upcoming tools clearly secondary.
- `sleep-lab.html`: daily logging, review, personal results, school summaries and help.
- One private school Sheet with stable account IDs is the agreed next-phase data
  model. See `DELIVERY-PLAN.md`. No per-student Sheet connection flow is needed.

## Visual direction

Navy and warm ivory. An expressive serif for headlines, a readable sans-serif for
body and controls, monospace only for secondary metadata. Precise spacing and
fine rules establish structure. A small number of rounded working surfaces and
clear selected states are appropriate. Avoid repeating a generic card for every
paragraph. Retain both day and night themes with equivalent care.

Graphics should explain the experiment and results. The fourteen-day figure is
an overview, never fabricated performance data. Keep exact charts in SVG or a
charting library; never use generated imagery for numeric evidence. No reference
image was supplied with the latest request.

## Interaction

- About 160ms for button feedback; 280ms for panel transitions.
- Introductory entrance motion is brief, finite and does not delay interaction.
- No looping decoration, autoplay background motion or scroll hijacking.
- Respect reduced-motion preferences in CSS and JavaScript.
- Consistent pressed, focus, selected, disabled, empty and error states.
- Save confirmation is precise: saved locally, waiting, syncing or confirmed.
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
HTML/CSS/JS and inline styles for this phase; no framework migration is needed to
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

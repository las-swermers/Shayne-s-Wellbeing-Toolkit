# Design brief — Sleep Lab & the toolkit shelf

Hand this to a design pass verbatim, with the reference board alongside it:
<https://www.cosmos.so/e/2028547921>

---

## The job

Restyle two existing pages. Do not redesign what they do — the structure,
copy and behaviour are settled and working. This is a skin.

- `index.html` — the shelf. A heading and four tool cards, rendered from `tools.js`.
- `sleep-lab.html` — the Sleep Lab. One file, five tabs, plus a printed sheet.

## Hard constraints

These are not preferences. Breaking any of them breaks the site.

1. **Two files, no build step.** Plain HTML/CSS/JS, served straight off GitHub
   Pages. No React, no Tailwind, no bundler, no npm. Styles stay inline in each
   file's own `<style>` block.
2. **Everything already in the page keeps working.** The tab bar and its arrow-key
   navigation, the night/day theme toggle, the sleep-pressure chart, the hours
   chart, the tracker form, the printed tracking sheet, the sign-in strip with
   its four states, and the staged flow — the stage card, the progress pips, the
   five-question review and its recommendation cards. Restyle them; do not
   rewrite their logic.
3. **The CSS custom properties are the theming system.** `--paper`, `--ink`,
   `--amber`, `--teal`, `--coral`, `--indigo`, `--hairline` and the rest are
   redefined under `:root[data-theme="day"]`, and the SVG charts read them at
   runtime via `getComputedStyle`. Change the *values* freely. Do not remove a
   token or hard-code a colour anywhere a token is in use.
4. **Both themes ship.** Night is the default; day must stay legible, not an
   afterthought. Check every chart in both.
5. **The print stylesheet survives.** Tab 07 prints to a signable A4 sheet.
6. **Mobile first, genuinely.** Boarding students read this on a phone in a dark
   room at 11pm. Nothing may scroll sideways.
7. **Accessible.** Keep every `aria-*` attribute and `role` already present. Text
   contrast at least 4.5:1 in both themes — including the amber on dark, which is
   marginal today.

## The direction

Modern minimal tech, with a pixel-era edge. Clean, concise, confident. Lots of
small icons doing real work, short text, nothing flashy or decorative for its own
sake. It should feel like a well-made instrument, not a wellness brochure.

What that means concretely:

- **Grid and hairlines over cards and shadows.** Structure comes from alignment
  and 1px rules, not from boxes floating on drop shadows. No rounded-corner card
  soup. Zero gradients used as decoration.
- **A monospace voice for the interface.** Labels, tab numbers, stat captions,
  axis ticks, buttons — small, uppercase, wide letter-spacing. The page already
  does this; push it further and make it consistent.
- **One expressive face for the headlines.** The page currently pairs a serif
  display face with a sans body. Either keep that tension or replace it with a
  sharper pairing — but keep the tension. A single-typeface page would go flat.
- **Pixel as a motif, not a filter.** Think 1px-stepped icons, blocky 8×8 or
  16×16 glyphs, stepped chart marks, a dot-matrix texture at very low opacity.
  Do not apply a pixelation effect to photographs or type; do not use a pixel
  font for body copy.
- **An icon system, hand-built.** No icon library — inline SVG only, one
  consistent grid and stroke weight, on a 24×24 box. Every tab needs one. Every
  stat tile, every strategy category, every state of the sign-in strip.
- **Restraint with colour.** One accent carries the page. Teal reads as good,
  coral as bad, in the charts only. Everything else is ink on paper.
- **Motion is small and purposeful.** A bar filling, a tab underline sliding.
  Nothing that moves while a tired person is trying to read.

## Where to spend the effort

In order:

1. **The stage card and the review.** This is the app now: a student opens My log
   and is told exactly where they are and what to do today. The progress pips,
   the "your review is ready" moment, the readout of their own numbers, and the
   recommendation cards are the emotional core of the tool. They currently look
   like ordinary form furniture.
2. **The printed tracking sheet.** A student fills this in by hand for fourteen
   nights and pins it up. It prints from the same file, so it has to work in black
   on white with no colour to lean on. Currently the weakest piece.
3. **The week-one/week-two comparison tables.** This is the whole point of the
   tool and it currently renders as a plain table. It should be the moment the
   page pays off.
4. **The school dashboard (tab 04).** Five stat tiles, two bar charts, one
   comparison. Make it read like an instrument panel, and remember a teacher may
   project it.
5. **The sign-in strip.** Four states — not connected, not signed in, signed in,
   syncing. It must say "your data is safe either way" at a glance.
6. **The shelf (`index.html`).** A different visual language from the Lab. Bring
   them into one system; the Lab is the reference.

## The copy

The text has been through an editing pass to cut length and strip the "X, not Y"
slogan construction that had crept into every heading. Hold that line:

- **Do not add words.** If a layout needs a subtitle, a strapline or filler body
  copy to look right, the layout is wrong. Design around the text that is there.
- **No slogans.** Nothing in the shape of "It is not X, it is Y", "not a promise,
  an experiment", or a heading that pivots on a comma into a reassurance.
- **Headings say what the section is.** "How the school is sleeping", not a line
  of encouragement.
- Plain and direct is the register. Not corporate, not therapeutic, not chirpy.

If a piece of copy genuinely does not work in the new layout, cut it or flag it —
do not rewrite it longer.

## Deliverable

The two files, edited in place, opening cleanly with no console errors, with every
tab checked in both themes at 360px and 1440px.

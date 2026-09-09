# Shayne's Wellbeing Toolkit

Static wellbeing tools for boarding-school students. No framework, no build step —
everything is plain HTML, CSS and JavaScript served straight from GitHub Pages.

The landing page and every guide are open to anyone with the link. A school Google
sign-in appears in exactly one place: the part of the Sleep Lab where a student
saves their own sleep record.

```
index.html            the shelf — heading, intro, tool cards
tools.js              the tool catalogue; one object per card
sleep-lab.html        the Sleep Lab, whole
apps-script/          the Google Sheet backend for the Sleep Lab
tools/<slug>/         one folder per future tool
```

## Publishing

**Settings → Pages → Deploy from a branch → `main` → `/ (root)`.**
The site lands at `https://las-swermers.github.io/shayne-s-wellbeing-toolkit/`.
`.nojekyll` stops Pages from mangling folders that start with an underscore.

## Adding a tool

1. Create `tools/<slug>/index.html`, or a single `<slug>.html` at the root for
   something self-contained.
2. Add one object to `tools.js`:
   `{ id, name, cat, blurb, href, access, icon }`.
3. `access` is `'open'` for anything readable without an account, `'school'` where
   a Google sign-in is involved, `'soon'` for a placeholder card.

Keep `href` relative. An absolute `github.io` URL breaks the moment the repository
is renamed or the site moves to a custom domain.

## The Sleep Lab

`sleep-lab.html` is the whole thing in one file. It runs a staged fortnight and
can run it more than once.

```
Week one          Review            Week two          Results
measure only  →   what your log  →  run 3 changes  →  the two weeks
                  says + 5 Qs                          side by side
```

| Tab | Access |
|---|---|
| 01 · How it works | Open to anyone. The ten changes, one chart, the printable sheet. |
| 02 · My log | The stage machine: where you are, what to do today, the review. |
| 03 · My results | Your charts, your week-one/week-two comparison. |
| 04 · The school | Anonymous aggregates, readable with a school login. |
| 05 · More help | Open to anyone. |

### The stages

A student is always in exactly one of these, and the log page says which:

1. **Week one** — log only. The review unlocks at `REVIEW_AFTER` nights
   (default 5 of 7, so a couple of missed mornings doesn't strand anyone).
2. **Review** — the page reads their baseline and shows it back: average sleep,
   time to fall asleep, wake-ups, how much their wake time moved. Then five
   questions about what a log *cannot* see — where the phone is, whether they
   work in bed, caffeine timing, daylight, what happens when they lie awake.
   Measured signals and answers are scored together and the top changes are
   offered with the student's own numbers as the reason.
3. **Week two** — the chosen changes appear as daily tick-boxes.
4. **Results** — the comparison, and the option to start another round.

Rounds are numbered. Every night carries its cycle, so a student can run a
second fortnight with different changes without losing the first.

**Out of the box it needs no setup.** With `CONFIG.ENDPOINT` blank everything
above works against the browser's own storage.

To switch on Google sign-in and the school numbers, follow
[`apps-script/SETUP.md`](apps-script/SETUP.md) — one Apps Script project bound to
a counselling-owned Sheet, deployed once. Students never receive the Sheet link.

### Tuning

| Setting | Default | What it does |
|---|---|---|
| `BASELINE_DAYS` / `INTERVENTION_DAYS` | 7 / 7 | Length of each week |
| `REVIEW_AFTER` | 5 | Baseline nights before the review unlocks |
| `RESULTS_AFTER` | 5 | Week-two nights before results appear |
| `MAX_TOOLS` | 3 | Changes a student may run at once |
| `STUDY_START` | blank | Class-wide start date; blank means each student's first night |

### Privacy shape

- Identity is Google's job. This site holds no passwords and no tokens.
- The Sheet lives in the counselling Drive and is a pastoral record.
- The school dashboard reads aggregate counts only, and stays blank until enough
  students have logged nights that nobody can be picked out of the totals.

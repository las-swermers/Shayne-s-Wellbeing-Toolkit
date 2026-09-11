# Shayne's Wellbeing Toolkit

> Current refinement: see [PROJECT-REVIEW.md](PROJECT-REVIEW.md) for the source audit,
> implemented fixes and outstanding release blockers. [GOOGLE-SETUP.md](GOOGLE-SETUP.md)
> documents the optional IAP/Sheet connectivity foundation. These current-status
> documents take precedence over older implementation-status statements below.
> The design preview remains local-only; student record sync is not deployed.


> **Design implementation branch:** the updated scope and next-phase architecture
> are in [DELIVERY-PLAN.md](DELIVERY-PLAN.md) and [DESIGN-BRIEF.md](DESIGN-BRIEF.md).
> This branch improves the local frontend and printing; it does not connect Google
> or enforce school sign-in. The backend description below documents the legacy
> prototype. Its JSONP, anonymity and sync claims are not production guarantees.
> The current decision is one private school Sheet with server-owned account IDs.
> Optional class studies use staff-generated cohort codes; students can remain in
> personal mode, and teacher/block labels belong to the cohort rather than each log.
> Follow the delivery plan where older constraints below conflict.

Static wellbeing tools for boarding-school students at Leysin American School,
built and owned by the counselling team. Plain HTML, CSS and JavaScript served
from GitHub Pages. No framework, no build step, no package manager.

The shelf (`index.html`) is a catalogue. The one finished tool on it is the
**Sleep Lab**, and that is what most of this document is about.

---

## What the Sleep Lab is

A structured self-experiment students run on their own sleep, and a class
dataset that comes out of it.

A student measures a week of their ordinary sleep, gets a review that reads
their own data back to them and recommends changes, runs those changes for a
second week, and then sees the two weeks side by side. Everyone's data, with
names stripped, feeds a school-wide comparison that anyone at the school can
look at.

```
  Week one          Review              Week two           Results
  ─────────         ──────              ────────           ───────
  log only          what your log       run 3 changes      your two weeks
  change nothing →  measured, plus   →  tick off what   →  side by side,
                    5 questions it      you managed        then optionally
                    cannot measure                         another round
```

It is used two ways at once:

- **Pastorally** — a student who sleeps badly gets a concrete, evidence-based
  thing to try, and a record they can bring to a counselling conversation.
- **As a class study** — a psychology or science class runs the fortnight
  together and analyses the aggregate. The limitations are stated in the tool on
  purpose (no control group, no blinding, regression to the mean) because
  arguing about them is part of the point.

---

## Why it is shaped this way

Read this section before changing anything structural. Each of these was tried
the other way first.

**The experiment is the product, not the guide.** An earlier version had eight
tabs of sleep education with tracking bolted to the side, and the
baseline-versus-intervention comparison behind a config flag that shipped turned
off. If you find yourself adding explanatory tabs, you are rebuilding that.

**The review comes after week one, never before.** The original quiz was the
first thing a student saw and asked them to self-diagnose with no data. Now it
runs on seven nights of real entries and only asks about what a log physically
cannot see — where the phone is, whether they work in bed, caffeine timing,
daylight, what happens while lying awake. Measured signals are ranked *ahead of*
self-report in the explanation, because the measurement is the half the student
did not already know. That is the payoff that makes week one worth doing.

**The review unlocks at 5 baseline nights, not 7.** A hard gate punishes the
student who forgot a morning or joined on Wednesday, and those are the students
most worth keeping in.

**Ten changes, not twenty-nine.** The long list was a browsing experience. Ten
is enough to cover light, timing, stimulus control, environment, cognitive load
and substances, and short enough that the recommendation engine can rank them
meaningfully.

**Local-first, always.** Every write lands in `localStorage` before any network
call. A dead endpoint, a signed-out student or a blocked cookie must never cost
someone the record they just typed. The whole tool works end to end with
`CONFIG.ENDPOINT` blank, and says so plainly rather than looking broken.

**Google Sheets, not a database.** Roughly 30 students × 14 nights is nothing.
Sheets means counselling can open the data, sort it, and hand a tab to a
teacher. A real database would add hosting, keys and a dashboard nobody can
casually inspect, for no benefit at this size. Reconsider only at thousands of
students.

**JSONP, not `fetch`.** An Apps Script web app redirects through
`googleusercontent.com` in a way that breaks cross-origin `fetch` and drops the
Google session cookie that identifies the student. A `<script>` tag has neither
problem. This is not legacy code — do not "modernise" it to `fetch`.

**One deployment, not two.** The class dashboard requires a school login rather
than being open to the world. That removed a whole second Apps Script deployment
from setup. The numbers it returns are anonymous either way.

**No copy padding.** The text has been through an editing pass that cut it by a
third and stripped an "X, not Y" slogan construction out of every heading. If a
layout needs a subtitle or filler body copy to look right, the layout is wrong.
See `DESIGN-BRIEF.md`.

---

## Repo map

```
index.html               the shelf: heading, intro, tool cards
tools.js                 the tool catalogue; one object per card
sleep-lab.html           the entire Sleep Lab, single file, ~1,670 lines
apps-script/Code.gs      Google Sheet backend, ~430 lines
apps-script/SETUP.md     how counselling deploys it
DESIGN-BRIEF.md          brief for the visual design pass (not yet done)
tools/sleep-lab/         redirect stub for old bookmarks
.nojekyll                stops Pages mangling folders
```

Adding a tool: create `tools/<slug>/index.html` (or `<slug>.html` at the root
for something self-contained) and add one object to `tools.js` —
`{ id, name, cat, blurb, href, access, icon }`. Keep `href` relative; an
absolute `github.io` URL breaks when the repo is renamed or moves to a domain.

---

## How `sleep-lab.html` is organised

One file: `<style>`, then markup, then one IIFE. The JavaScript is divided by
banner comments (`/* ═════════ NAME ═════════ */`) — grep for those to navigate.

| Section | What lives there |
|---|---|
| `CONFIG` | Every tunable. See the table below. |
| `STORAGE` | `Store` — localStorage with a silent in-memory fallback. Never throws. |
| `NETWORK` | `Net.call()` — the JSONP transport. Best-effort, always fails quietly. |
| `ACCOUNT` | `Account` — sign-in state. No tokens, no passwords; Google holds identity. |
| `DATA` | `STRATS` — the ten changes. Each has `id`, `name`, `effort`, `why`, `how`. |
| `STATE` / `PERSISTENCE` | `state`, `saveAll()`, `loadAll()`, plus small helpers. |
| `TABS` / `THEME` | Tab switching, arrow-key nav, night/day toggle. |
| `VIZ 1 · SLEEP PRESSURE` | The one physiology chart, hand-drawn SVG. |
| `SIGNALS` | `signals()` — what the baseline week says without asking. |
| `REVIEW` | `REVIEW_Q` (the five questions) and `recommend()` (the scoring). |
| `TRACKER` | The log form, the stats, the comparison table, the hours chart. |
| `CYCLES & STAGES` | `phaseFor()`, `stage()`, `restamp()`. The state machine. |
| `STAGE & REVIEW UI` | `renderStage()`, `renderReview()`. What the student sees. |
| `RENDERING` | The tool list and the printed tracking sheet. |
| `SYNC` | Pull, push, the sync ledger, sign-in popup. |
| `WHOLE-SCHOOL DASHBOARD` | Reads aggregates, renders bars and the comparison. |

### State shape

```js
state = {
  cycles: [                       // one entry per round; last is current
    { n: 1,                       // round number
      start: '2026-09-14',        // first baseline morning of this round
      picked: ['light-am', ...],  // the changes chosen at review, max MAX_TOOLS
      answers: { awake:'head', phone:'inbed', ... },
      committed: '2026-09-21' }   // date they started week two; '' until then
  ],
  log: [
    { date:'2026-09-14',          // the MORNING they woke, not the evening
      out:'22:45', up:'07:05',    // lights out, out of bed
      lat: 25, wk: 1,             // minutes to sleep, times woken
      inBed: 500, asleep: 463,    // derived, minutes
      eff: 93, energy: 4,         // efficiency %, how the day felt 1-5
      done: 2, of: 3,             // changes managed / chosen
      phase: 'baseline',          // 'baseline' | 'intervention' | 'after' | ''
      cycle: 1 }                  // which round this night belongs to
  ],
  synced: { '2026-09-14': '22:45|07:05|25|1|4|2|3|baseline|1' }
}
```

Persisted to `localStorage` under `sleeplab` with `v:2`. `loadAll()` migrates v1
saves (a flat `picked` array, no cycles) into a single cycle.

### Three things that will bite you

**`restamp()` rewrites `phase` and `cycle` on every entry whenever the log
changes.** It has to: the very first night is saved *before* any start date
exists to anchor it, so without restamping it stays outside its own comparison
forever. Call it (or `renderLog()`, which calls it) after any log mutation, and
`saveAll()` *after* that, not before.

**A new round must start after the last logged night.** `cycleFor()` returns the
last cycle whose `start` is on or before a date, so a round starting "tomorrow"
would silently steal the previous round's final nights. The `#newCycle` handler
guards this.

**`sigOf()` is the sync ledger's fingerprint.** `state.synced` maps a date to
the shape the Sheet last confirmed. An entry whose current signature differs is
pending and gets pushed; an entry that matches defers to the server on pull.
That is what lets two devices disagree sensibly. If you add a field that should
survive a round trip, add it to `sigOf()` or it will never re-sync.

### Recommendation scoring

`recommend(signals, answers)` in the `REVIEW` section. Each rule calls
`add(toolId, points, reason, fromData)`. Measured rules pass `fromData: true`
and their reason is rendered first; a self-report reason is appended after it.
Tools are ranked by total points, top four are offered, and three defaults fill
in if nothing scored — nobody leaves the review empty-handed.

Every id passed to `add()` must exist in `STRATS`. There is no runtime check.

---

## The backend (`apps-script/Code.gs`)

A script **bound** to a counselling-owned Google Sheet, deployed once as a web
app with **Execute as: Me** and **Access: Anyone in \<the school\>**. That
combination is the whole auth model: Google performs the login and hands the
script a verified school email, the script touches the Sheet with counselling's
own access, and students never receive the Sheet link or need any access to it.

Routes, all JSONP, all via `doGet`:

| Route | Does |
|---|---|
| `me` | Identity plus that student's own nights |
| `save` | Upsert one night (keyed on email + date) |
| `cycle` | Record what a student chose for a round, and when |
| `delete` | Remove one night |
| `class` | Anonymous aggregates for the school tab |
| `signin` | A page that closes itself; the sign-in popup target |

Sheet tabs: `Roster` (optional consent list), `Students`, `Nights`, `Cycles`.
`Cycles` is the interesting one for analysis — one row per student per round,
recording which changes they picked and when they committed.

**Anonymity is structural, not a promise.** `classSummary_()` is the only thing
the school tab can reach, it returns counts, and it withholds everything until
`MIN_STUDENTS` (5) different students have logged. Any bar under `MIN_BUCKET`
(3) nights is folded away. Results are cached for `CACHE_SECONDS` (300)
deliberately — an instantly-updating public counter identifies whoever just
typed. There is no route that lists students and none that returns another
person's rows.

Run `setupSheets` once after pasting the script; run `selfTest` any time for a
one-glance status.

---

## Configuration

### `sleep-lab.html` → `CONFIG`

| Key | Default | Meaning |
|---|---|---|
| `ENDPOINT` | `''` | Apps Script `/exec` URL. Blank = local-only, and the page says so. |
| `SCHOOL_NAME` | `'school'` | Shown on the sign-in strip |
| `STUDY_START` | `''` | Class-wide first baseline morning. Blank = each student's first night. |
| `BASELINE_DAYS` / `INTERVENTION_DAYS` | `7` / `7` | Length of each week |
| `MAX_TOOLS` | `3` | Changes a student may run at once |
| `REVIEW_AFTER` | `5` | Baseline nights before the review unlocks |
| `RESULTS_AFTER` | `5` | Week-two nights before results appear |

### `apps-script/Code.gs` → `CONFIG`

| Key | Default | Meaning |
|---|---|---|
| `TIMEZONE` | `'Europe/Zurich'` | |
| `ALLOWED_DOMAIN` | `''` | Extra domain check on top of the deployment setting |
| `REQUIRE_ROSTER` | `false` | `true` = approve each student on the `Roster` tab first |
| `MIN_STUDENTS` / `MIN_BUCKET` | `5` / `3` | Anonymity thresholds |
| `STUDY_START` / `BASELINE_DAYS` / `INTERVENTION_DAYS` | `''` / `7` / `7` | Must match the page |
| `CACHE_SECONDS` | `300` | Dashboard staleness |

If you set `STUDY_START`, set it in **both** files.

---

## Constraints

Breaking any of these breaks the site.

1. **No build step.** No npm, no bundler, no framework. Styles stay inline in
   each file's own `<style>` block.
2. **CSS custom properties are the theming system.** `--paper`, `--ink`,
   `--amber`, `--teal`, `--coral`, `--indigo`, `--hairline` and friends are
   redefined under `:root[data-theme="day"]`, and the SVG charts read them at
   runtime via `getComputedStyle`. Change values freely; never delete a token or
   hard-code a colour where one is in use.
3. **Both themes ship.** Night is default; day must be legible, including every
   chart and the printed sheet.
4. **The print stylesheet is load-bearing.** `#p-sheet` is hidden on screen and
   is the only thing that prints — a fourteen-column grid students fill in by
   hand. It must work in black on white with no colour to lean on.
5. **Mobile first.** Students read this on a phone in a dark room at 11pm.
   Nothing may scroll sideways at 360px.
6. **Keep every `aria-*` and `role`.** Text contrast at least 4.5:1 in both
   themes.

---

## Working on this

There is no test suite. The verification loop is a real browser:

```bash
npx http-server -p 8080 -s .
```

Chromium and Playwright are available in the Claude Code remote environment
(`/opt/node22/lib/node_modules/playwright`, browsers at `/opt/pw-browsers` —
never run `playwright install`). Drive the page rather than trusting a diff:
log a run of nights, answer the review, commit, check the comparison, start a
second round, and read `localStorage.sleeplab` to confirm cycle boundaries.
Check both themes at 390px and 1440px, and screenshot with
`emulateMedia({ media:'print' })` for the tracking sheet.

Syntax-check before serving — the script block is large enough that a typo is
easy to miss:

```bash
python3 -c "import re;print(re.findall(r'<script[^>]*>(.*?)</script>',open('sleep-lab.html').read(),re.S)[0])" > /tmp/c.js
node --check /tmp/c.js
```

To exercise sign-in and the school dashboard without deploying, stand up a
throwaway JSONP server that answers `me`, `save`, `cycle`, `delete` and `class`,
and point `CONFIG.ENDPOINT` at it in a copy of the file.

Publishing: **Settings → Pages → Deploy from a branch → `main` → `/ (root)`**.
Vercel also builds the repo and comments a preview URL on every pull request.

---

## Open threads

- **The visual design pass has not happened.** `DESIGN-BRIEF.md` is written and
  ready to hand to a design tool or a designer. The direction is modern minimal
  tech with a pixel-era edge; the highest-value targets are the stage card and
  review, then the printed sheet, then the comparison tables.
- **Nothing is connected yet.** `CONFIG.ENDPOINT` is blank in `main`. The Sheet
  and the deployment are a deliberate next step for counselling.
- **The other three tools on the shelf are placeholders** — first weeks away,
  exam nerves, roommate agreement. They are `access: 'soon'` cards in `tools.js`
  with no page behind them.

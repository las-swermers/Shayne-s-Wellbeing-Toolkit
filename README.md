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

`sleep-lab.html` is the whole thing in one file. It runs a two-week experiment:
measure a week of ordinary sleep, change two or three things, measure a second
week, compare.

| Tab | Access |
|---|---|
| 01 · How it works | Open to anyone. Ten changes, one chart, and the printable tracking sheet. |
| 02 · My log | Works offline; signs in for a record that follows the student. |
| 03 · The school | Anonymous aggregates, readable by anyone with a school login. |
| 04 · More help | Open to anyone. |

**Out of the box it needs no setup.** With `CONFIG.ENDPOINT` blank the log saves to
the student's own browser, their week-one/week-two comparison still works, and the
school tab says plainly that it is not connected yet.

To switch on Google sign-in and the school numbers, follow
[`apps-script/SETUP.md`](apps-script/SETUP.md) — one Apps Script project bound to a
counselling-owned Sheet, deployed once. Students never receive the Sheet link and
never need access to it.

### The fortnight

`CONFIG.STUDY_START` sets the first morning of week one, so a whole class runs the
same two weeks. Leave it blank and each student's first logged night becomes their
own day one. Either way the page always knows where a student is and says so.

### Privacy shape

- Identity is Google's job. This site holds no passwords and no tokens.
- The Sheet lives in the counselling Drive and is a pastoral record.
- The school dashboard reads aggregate counts only, and stays blank until enough
  students have logged nights that nobody can be picked out of the totals.

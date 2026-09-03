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

`sleep-lab.html` is the whole thing in one file — eight tabs, from how sleep works
through to where to get help.

| Tab | Access |
|---|---|
| 01–04 · How sleep works, Sleep check, Toolkit, My plan | Open to anyone |
| 05 · My tracker | Works offline; signs in for a record that follows the student |
| 06 · The whole school | Open to anyone — anonymous aggregates |
| 07–08 · Print & sign, More help | Open to anyone |

**Out of the box it needs no setup.** With `CONFIG.STUDENT_ENDPOINT` and
`CONFIG.PUBLIC_ENDPOINT` left blank, the tracker saves to the student's own browser
and the school dashboard says plainly that it is not connected yet.

To switch on Google sign-in and the live dashboard, follow
[`apps-script/SETUP.md`](apps-script/SETUP.md). The short version: one Apps Script
project bound to a counselling-owned Sheet, deployed twice — once for signed-in
students on your domain, once for the anonymous public dashboard. Students never
receive the Sheet link and never need access to it.

### Privacy shape

- Identity is Google's job. This site holds no passwords and no tokens.
- The Sheet lives in the counselling Drive and is a pastoral record.
- The public dashboard can only read aggregate counts, and stays blank until
  enough students have logged nights that nobody can be picked out of the totals.

# LS · Wellbeing

Public, static wellbeing tools for boarding-school students. The landing page is open to everyone. A school login is only needed for a tool that records student data in a counselling-owned Google Sheet.

## Publish with GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Build and deployment** to **Deploy from a branch**.
3. Choose the production branch (usually `main`) and the `/ (root)` folder, then save.
4. The site will be available at `https://swermers.github.io/ls-wellbeing/` once the Pages deployment completes.

`.nojekyll` ensures GitHub Pages serves the static folders as written.

## Add a tool

1. Create `tools/<slug>/index.html`.
2. Add one object to `tools.js`: `{ id, name, cat, blurb, href, access }`.
3. For a static tool use `href: 'tools/<slug>/'` and `access: 'open'`. For a deployed school data tool use its Apps Script `/exec` URL and `access: 'school'`. Use `access: 'soon'` for a placeholder.

No framework or build step is required.

## Connect Sleep Lab to the counselling Sheet

The public Sleep Lab is at `tools/sleep-lab/` and saves its experiment locally in the student's browser. Follow [`tools/sleep-lab/SHEET.md`](tools/sleep-lab/SHEET.md) to create the staff-owned Sheet, deploy the Apps Script web app, and then change the single Sleep Lab catalog object to its `/exec` URL. Students should never receive the Sheet link or editor access.

# Sleep Lab Sheet setup

This keeps the spreadsheet in counselling's Drive. Students use the deployed web-app URL; **do not share the Sheet URL or grant students edit access**.

## Before deployment

1. In the counselling Drive, create a Google Sheet named **Sleep Lab**.
2. Open **Extensions → Apps Script**. This must be a *bound* script (opened from that Sheet).
3. Replace the default `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs).
4. Add an HTML file named **Index**, and paste in [`apps-script/Index.html`](apps-script/Index.html). This is the full Lab page plus its small `google.script.run` bridge. The static page remains the public fallback until this has been tested.
5. In `Code.gs`, staff fill in `CONFIG.STUDY_START` as the first **baseline** night (`YYYY-MM-DD`), and confirm `BASELINE_DAYS: 7`, `INTERVENTION_DAYS: 7`, and `TIMEZONE: 'Europe/Zurich'`. Change the dates for each new study; do not change them mid-study.
6. Run `setupSheets` once in the Apps Script editor and approve the Google permissions. It creates `Nights`, `Plans`, `Roster`, and `Class` with their exact headers.
7. Populate `Roster` before inviting students. One row per consenting student:

   `code, school_email, house, cohort, consent, updated_at`

   Use a unique four-character code for the fallback path. Set `consent` to `yes` only for students who may submit. The email can be blank only if the student will use the counsellor-issued code.

## Browser-to-Sheet bridge

The supplied [`apps-script/Index.html`](apps-script/Index.html) already contains the bridge. It calls `loadMine` when it opens and calls `savePlan` / `saveNight` from the existing form buttons. It also includes a “Counsellor-issued code” field for the rare case where Google does not expose a school email. Do not place API keys, Sheet IDs, or roster data in the HTML.

## Deploy and test

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as: User accessing the web app** and **Who has access: Anyone in the organisation**.
3. Deploy, approve access, and copy the `/exec` URL. Test with a consenting student account: save a plan and night; check `Plans` and `Nights` in the counselling Sheet. `Class` contains anonymous baseline/intervention totals only—never emails.
4. Only after this test, change the Sleep Lab object in `tools.js` to the web-app `/exec` URL and set `access: 'school'`. Until then it intentionally stays `href: 'tools/sleep-lab/'` and `access: 'open'`.

## Data behaviour

`Nights` is upserted by student identity (school email, or fallback code) plus date. `Plans` is one row per student. `Class` is regenerated from non-identifying aggregates, while email addresses remain out of that tab.

# Switching the Sleep Lab on

The Lab works with nothing connected: students can read the guide, print the
tracking sheet, log nights and see their own two-week comparison, all saved in
their own browser. Everything below is about the extra step — students signing in
with their school Google account so their log follows them between devices, and
the school seeing its own anonymous numbers.

One Sheet, one script, one deployment. About fifteen minutes.

---

## 1 · Create the Sheet

1. In the counselling Drive, create a Google Sheet called **Sleep Lab**.
2. **Extensions → Apps Script**. This opens a script *bound* to that Sheet, which
   is what lets it write without any keys or credentials.
3. Delete the placeholder `Code.gs` contents and paste in [`Code.gs`](Code.gs).
4. At the top of the file, set:
   - `TIMEZONE` — yours, if not `Europe/Zurich`.
   - `ALLOWED_DOMAIN` — your school's mail domain, e.g. `'lasglion.ch'`.
   - `STUDY_START` — the first morning of week one, if the whole class runs the
     same fortnight. Leave it blank and each student's first logged night becomes
     their own day one.
   - `REQUIRE_ROSTER` — leave `false` to let any signed-in school account take
     part. Set `true` to approve each student first, using the `Roster` tab.
5. Run **`setupSheets`** once from the editor toolbar and approve the permissions.
   It creates the `Roster`, `Students`, `Nights` and `Cycles` tabs.

---

## 2 · Deploy it

- **Deploy → New deployment → Web app**
- **Execute as: Me.** The script touches the Sheet with *your* access, so students
  need none of their own.
- **Who has access: Anyone in \<your school\>.** Google handles the login and hands
  the script a verified school email. There is no password anywhere in this system
  for you to look after.
- Deploy, approve, and copy the `/exec` URL.

Anyone at the school can then read the anonymous class numbers. Nobody outside the
school reaches the script at all.

---

## 3 · Point the page at it

Open `sleep-lab.html`, find `CONFIG` near the top of the `<script>`, and fill in:

```js
var CONFIG = {
  ENDPOINT:    'https://script.google.com/a/macros/yourschool.ch/s/AKfy…/exec',
  SCHOOL_NAME: 'Leysin American School',
  STUDY_START: '2026-09-14',   // match the Apps Script value, or leave blank
```

Commit and push. GitHub Pages redeploys in a minute or two.

---

## 4 · Test before anyone else sees it

1. Open the Lab signed into a **student** account.
2. **My log** → the strip at the top should offer to sign you in. It should settle
   to *Signed in* with the school address shown.
3. Log a night. The strip should read **Up to date**, and a row should appear in
   the `Nights` tab.
4. Reload. The night should come back down from the Sheet, not just the browser.
5. **The school** should load with either the numbers or the "not enough students
   yet" message.
6. Run **`selfTest`** in the Apps Script editor for a one-glance summary.

The dashboard stays blank until `MIN_STUDENTS` (default 5) different students have
logged something, and any bar with fewer than `MIN_BUCKET` (default 3) nights
behind it is folded away. That is the anonymity guarantee. Lower those numbers only
as a deliberate decision.

---

## Running the fortnight with a class

- Set `STUDY_START` in **both** `Code.gs` and `sleep-lab.html` to the first Monday.
- Hand out the printed tracking sheet so students have something physical for
  week one.
- **Week one** the page tells them to change nothing and shows how many nights
  remain before their review unlocks (5 by default).
- **The review** reads their own baseline back to them, asks five questions, and
  recommends changes with their numbers as the reason. They pick three and commit.
- **Week two** their choices appear as daily tick-boxes.
- **Results** puts the two weeks side by side, and offers another round.

Each round is numbered. The `Nights` tab carries a `cycle` column and the
`Cycles` tab records what each student chose and when — one row per student per
round, which is the table to look at if you want to know which changes were
popular and which actually moved anything.

---

## Things worth knowing

**Changing the script after deploying.** Edits do not go live on their own. Use
**Deploy → Manage deployments → edit (pencil) → Version: New version**, which keeps
the same URL.

**The dashboard is cached** for five minutes (`CACHE_SECONDS`). A night just logged
will not appear there instantly, which is deliberate: an instantly-updating counter
is a way to identify whoever just typed.

**Deleting.** A student deleting a night in the Lab deletes it from the Sheet too.
Deleting their whole log asks first.

**What is in the Sheet.** `Nights` holds a school email against each night, so a
student can see their own history and so counselling can follow up if asked. Treat
it as a pastoral record: it lives in the counselling Drive, and it is not the
document students or teaching staff open.

**What is not.** There is no route that lists students and no route that returns
another person's rows. The class dashboard can only call `classSummary_`, which
returns totals.

# Switching the Sleep Lab on

The Lab works with nothing connected: students can read the guide, build a plan,
log nights and print a sheet, all saved in their own browser. Everything below is
about the extra step — students signing in with their school Google account so
their log follows them between devices, and the whole school seeing an anonymous
picture of how it is sleeping.

Roughly twenty minutes, once.

---

## What you are building

Three doors, two of them open to everyone:

| | Who gets in | Where it lives |
|---|---|---|
| The guide, the toolkit, the plan builder | Anyone with the link | `sleep-lab.html`, static |
| **The whole school** dashboard | Anyone with the link | Aggregate counts from the Sheet |
| **My tracker**, signed in | A student on your Google domain | Their own row set in the Sheet |

One Google Sheet, owned by counselling, holds everything. Students never get its
link and never get edit access — the script reads and writes on their behalf.

---

## 1 · Create the Sheet

1. In the counselling Drive, create a Google Sheet called **Sleep Lab**.
2. **Extensions → Apps Script**. This opens a script *bound* to that Sheet, which
   is what lets it write without any keys or credentials.
3. Delete the placeholder `Code.gs` contents and paste in
   [`Code.gs`](Code.gs) from this folder.
4. At the top of the file, set:
   - `TIMEZONE` — yours, if not `Europe/Zurich`.
   - `ALLOWED_DOMAIN` — your school's mail domain, e.g. `'lasglion.ch'`. This is
     belt-and-braces on top of the deployment setting below.
   - `REQUIRE_ROSTER` — leave `false` to let any signed-in school account take
     part. Set `true` if you want to approve each student first (see step 5).
   - `STUDY_START` — only if you are running the fortnight as a baseline-then-
     intervention study. Leave blank for an open-ended tracker.
5. Run **`setupSheets`** once from the editor toolbar and approve the permissions
   Google asks for. It creates the `Roster`, `Students` and `Nights` tabs.

If you set `REQUIRE_ROSTER: true`, fill `Roster` in before inviting anyone: one
row per student, `consent` set to `yes`. Anyone not on it is turned away politely
and told to speak to counselling.

---

## 2 · Deploy it twice

Same script, two deployments, because they answer to different audiences.

**Deployment A — students**

- **Deploy → New deployment → Web app**
- Description: `Sleep Lab · students`
- **Execute as: Me.** This is the important one. It means the script touches the
  Sheet with *your* access, so students need none of their own.
- **Who has access: Anyone in \<your school\>.** Google now handles the login and
  hands the script a verified school email. There is no password anywhere in this
  system for you to look after.
- Deploy, approve, copy the `/exec` URL.

**Deployment B — the public dashboard**

- **Deploy → New deployment → Web app** again
- Description: `Sleep Lab · public dashboard`
- **Execute as: Me**
- **Who has access: Anyone.** Safe, because the only route that answers without a
  verified school login is `class`, and `class` returns counts — never an email,
  never a row, never a single night on its own.
- Deploy and copy that `/exec` URL too.

---

## 3 · Point the page at them

Open `sleep-lab.html`, find the `CONFIG` block near the top of the `<script>`,
and paste the two URLs in:

```js
var CONFIG = {
  STUDENT_ENDPOINT: 'https://script.google.com/a/macros/yourschool.ch/s/AKfy…/exec',
  PUBLIC_ENDPOINT:  'https://script.google.com/macros/s/AKfy…/exec',
  SCHOOL_NAME:      'Leysin American School',
```

Commit and push. GitHub Pages redeploys in a minute or two.

---

## 4 · Test it before anyone else sees it

1. Open the Lab in a browser signed into a **student** account.
2. Go to **My tracker**. The strip at the top should offer to sign you in; do it,
   and it should settle to *Signed in* with the school address shown.
3. Log a night. The strip should read **Up to date**, and a row should appear in
   the `Nights` tab of the Sheet.
4. Reload. The night should come back down from the Sheet, not just from the
   browser.
5. Open the Lab in a private window, signed into nothing. **The whole school**
   should still load. **My tracker** should say *Not signed in* and still work
   locally.
6. Run **`selfTest`** from the Apps Script editor for a one-glance summary.

The dashboard stays deliberately blank until `MIN_STUDENTS` (default 5) different
students have logged something, and any single bar with fewer than `MIN_BUCKET`
(default 3) nights behind it is folded away. That is the anonymity guarantee. If
you lower those numbers, do it as a decision rather than by accident.

---

## Things worth knowing

**Changing the script after deploying.** Edits do not go live on their own. Use
**Deploy → Manage deployments → edit (pencil) → Version: New version** on *both*
deployments, which keeps the same URLs.

**The dashboard is cached** for five minutes (`CACHE_SECONDS`), so a night you
just logged will not appear there instantly. This is intentional: an
instantly-updating public counter is a way to identify the person who just typed.

**Deleting.** A student deleting a night in the Lab deletes it from the Sheet too.
Deleting their whole log asks first, so they can keep the school copy if they want.

**What is in the Sheet.** `Nights` holds a school email against each night, so a
student can see their own history and so counselling can follow up if a student
asks for help. Treat it like any other pastoral record: it lives in the
counselling Drive, it is not shared, and it is not the same document as anything
students or teaching staff can open.

**What is not.** The public dashboard cannot reach `Nights`. It can only call
`classSummary_`, which returns totals. There is no route that lists students, and
no route that returns another person's rows.

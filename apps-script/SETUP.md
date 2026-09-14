# Connect Sleep Lab without a billing account

No Vercel environment variables, Cloud Shell, service-account key or OAuth client secret are needed for this version. The landing page stays on Vercel. The connected Lab opens in a Google-hosted page using the same layout and styles.

Your existing /exec URL stays the same. Do not create a second deployment.

## Update the existing script

1. Open your [Sleep Tracker Sheet](https://docs.google.com/spreadsheets/d/1XQ2Z06jgvcjet1ZNgHPnAnMaQ8AGce0RkuCBo9yMK5k/edit). Choose **Extensions → Apps Script**.
2. Open **Code.gs**. Replace its contents with [the updated Code.gs](Code.gs).
3. Beside **Files**, click **+ → HTML**. Name the file **Lab** (Google adds .html). Paste the entire contents of [Lab.html](Lab.html). If Lab already exists, replace that file instead. Save both files.
4. In the function dropdown at the top, choose **setupSheets**, then click **Run**. Approve Google's requested access if prompted. This adds a **Records** tab and creates the account-ID key internally. Existing tabs are preserved. Do not erase or rotate ACCOUNT_ID_KEY in Script Properties.
5. Choose **selfTest** and click **Run**. Confirm all four checks say **PASS**. This checks the editor files; the deployed app still needs a live check.
6. Choose **Deploy → Manage deployments → pencil → Version: New version → Deploy**. Keep **Execute as: Me** and **Who has access: Anyone in Leysin American School**. Keep the Sheet itself private.

Updating code in GitHub does not update Apps Script. The two files above must be copied into Apps Script and deployed.

If the web app only says **“Signed in as … You can close this window”**, it is still serving the old version. The updated version opens the full Sleep Lab and has **Sign out of Sleep Lab** in My log. Check that both files were saved, then select **New version** in the existing deployment and open its `/exec` URL again. Also check that you updated the deployment matching the URL used by the website.

The Vercel page saying **Saving to this browser** is expected: that page is the local diary. The Google-hosted Lab holds the connected record. Moving Vercel to production does not update the Google-hosted app or transfer browser entries.

## Try it yourself

Open the same [connected Sleep Lab](https://script.google.com/a/macros/las.ch/s/AKfycbzZ5h0XCN_kRuv0RtWNSBs8fwdtGJCxpTJzy1xuSQLY298wSKrFscsucNDwCYoaVvOA/exec).

- Save one test night. Wait for **Up to date**. Find it in the **Records** tab (new saves no longer go to Nights).
- Reload the connected Lab, and open it on another device with the same account. Confirm the date, times, awake minutes and chosen changes.
- Edit that night, then delete it. Wait for **Up to date** after each action. Its payload and display fields should be cleared when deleted.
- Click **Sign out of Sleep Lab**. The page should clear its account cache and show a signed-out screen. Gmail remains signed in.
- Have one other approved account open the connected Lab: it should have its own empty history. A personal Google account must be refused.
- Try a failed connection and press **Sync now** after reconnecting. The pending change should survive a page reload if browser storage is available.

These steps are the live acceptance checks. Local automated tests use simulated Google and Sheets services; they cannot prove your organisation's identity settings work.

If the page says it cannot open, check the active Google account, the presence of Lab.html and whether setupSheets completed. Some Workspace policies prevent Apps Script from returning a student's email; it refuses access if identity is blank. Test with an actual second school account before inviting students.

## Publish the website changes

After the connected Lab works, merge the review PR. It includes PR #10's compact Entry/Calendar workspace and points the public Lab's **Open connected Sleep Lab** button to the existing URL. Keep Cloud Run PR #11 unmerged.

Vercel continues to serve a static site. No new environment variables or build command are required. Existing browser-only diaries stay on their original Vercel origin and are not silently uploaded or transferred between accounts. Export a CSV and enter any missing paper/browser nights by their original dates if needed.

## What changes in the Sheet

New records use a stable account ID and a JSON payload, with readable time/rating columns alongside it. They are pseudonymous, not guaranteed anonymous. The app derives IDs from the verified school email and a server-held key; a changed school email needs an explicit account migration.

Existing Nights and Cycles rows are read for their original owner. Those older tabs may still contain email addresses. New records override the corresponding old entries; deleting a record also removes its matching old row. Old metrics retain their historical calculation method until the student edits the entry and supplies awake minutes. Old free-text strategy names are preserved in the legacy Cycles tab; recognised strategy names are mapped into the current choices.

A deleted record keeps only a revision marker so an old device cannot silently upload it again. The Sheet's own version history is subject to the owner's retention arrangements. Sign-out clears only this Lab account's cache in this browser; old public-site diaries and other browser tabs are separate.

Group summaries are deliberately not released in this version. The previous thresholds counted nights instead of distinct people in some views and could reveal small groups through subtraction. A separate aggregate/privacy pass is required before enabling group or class-code reports.

## For future code changes

Run `node scripts/build-apps-script.mjs` after editing sleep-lab.html or its CSS; commit the generated Lab.html. It bundles the Lab's styles and logic. Images, fonts and the printable PDF use public HTTPS asset URLs.

Only `labRequest` handles student data. It checks the verified account and revocable Lab session on every call; Google Apps Script's native RPC carries payloads. The old JSONP and URL write routes are disabled. Owner setup functions reject student callers.

Sources: [Google's native browser/server communication](https://developers.google.com/apps-script/guides/html/communication), [Apps Script identity availability](https://developers.google.com/apps-script/reference/base/session), [Google's JSONP security warning](https://developers.google.com/apps-script/guides/content).


## Class-code pilot: only after reviewing this draft

This adds class membership and teacher invitations. It does not share or compare sleep results yet. No Vercel environment variables are needed.

1. Replace both **Code.gs** and **Lab.html** with the files from this same branch. Keep the HTML name **Lab** (capital L; do not type the extension).
2. Run **setupSheets** if this is a new project, then run **setupClasses**. This creates Teachers, Classes, Memberships and Comparisons. It preserves diary rows and grants nobody teacher access automatically.
3. In the private workbook, open **Teachers**. Add approved staff below the headers: their school email under `school_email`, the name students should see under `display_name`, and `yes` under `active`. The workbook owner controls approval. Do not give students workbook access or put real teacher emails into GitHub.
4. Run **selfTest**, then update the existing deployment to **New version** as above. Keep school-only access and execute as the owner.
5. Reopen the connected Lab. Approved staff get a **Teacher** tab. Create a class, choose its study dates and copy the student join code. Codes expire after seven days; **New join code** replaces the old one. **Close joining** keeps existing memberships; **Archive class** removes them and revokes its comparison connections. No diary entries are deleted by either action.
6. A student opens **Group view**, previews the code, checks the teacher/class and confirms joining. Students can leave without losing their personal log. The pilot permits one class per overlapping study period.
7. To connect two classes, the first teacher chooses **Invite comparison** and sends that separate code to the other teacher. The other teacher previews it and confirms one of their own classes with the exact same study dates. Each class can have one accepted comparison connection. Either teacher can revoke it. Results remain unavailable until the later summary release.

For the pilot, use two approved staff accounts and a separate school test account. Check joining, leaving, expired/replaced codes, staff removal and class archiving before inviting a class. Changing a Teachers row from `yes` to `no` blocks teacher actions and new joins to that teacher's classes immediately; it does not transfer class ownership. To hand a class to another teacher, archive it and create a new one in this version.

Student membership is pseudonymous in the private Sheet. Class names, teacher display names and study dates are shown to signed-in school accounts with a valid code; do not use sensitive class names. A code alone does not grant diary access. Codes are stored as keyed digests and shown once; the browser does not save them. Request throttling uses Apps Script's best-effort cache and is not a guaranteed durable abuse limit. Agree retention and class sizes before any shared summary release.

Next release: explicit contribution choices, fixed-period aggregates, distinct-student thresholds, rounded approved snapshots, overlap/subtraction protections, and deletion/withdrawal handling. No current class route reads the Records, Nights or Cycles tabs.

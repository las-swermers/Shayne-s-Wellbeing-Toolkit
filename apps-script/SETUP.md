# Connect Sleep Lab without a billing account

No Vercel environment variables, Cloud Shell, service-account key or OAuth client secret are needed for this version. The landing page stays on Vercel. The connected Lab opens in a Google-hosted page using the same layout and styles.

Your existing /exec URL stays the same. Do not create a second deployment.

## Update the existing script

1. Open your [Sleep Tracker Sheet](https://docs.google.com/spreadsheets/d/1XQ2Z06jgvcjet1ZNgHPnAnMaQ8AGce0RkuCBo9yMK5k/edit). Choose **Extensions → Apps Script**.
2. Open **Code.gs**. Replace its contents with [the updated Code.gs](Code.gs).
3. Beside **Files**, click **+ → HTML**. Name the file **Lab** (Google adds .html). Paste the entire contents of [Lab.html](Lab.html). If Lab already exists, replace that file instead. Save both files.
4. In the function dropdown at the top, choose **setupSheets**, then click **Run**. Approve Google's requested access if prompted. This adds a **Records** tab and creates the account-ID key internally. Existing tabs are preserved. Do not erase or rotate ACCOUNT_ID_KEY in Script Properties.
5. Choose **Deploy → Manage deployments → pencil → Version: New version → Deploy**. Keep **Execute as: Me** and **Who has access: Anyone in Leysin American School**. Keep the Sheet itself private.

Updating code in GitHub does not update Apps Script. The two files above must be copied into Apps Script and deployed.

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


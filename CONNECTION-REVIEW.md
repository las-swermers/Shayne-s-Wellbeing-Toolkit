# Sleep Lab connection review — 13 September 2026

## Evidence

Rockbot changed main at 417b3d9 to set the existing las.ch Apps Script URL and account label. Its handoff is on PR #11. User screenshots show successful sign-in and two rows in Nights. This demonstrates writes from that user's browser, not cross-device correctness or other-account isolation.

PR #10 contains the compact calendar, flexible baseline and reviewed suggestion rules but is still open. PR #11 contains a Cloud Run alternative and is paused. This review brings PR #10's source changes together with the Apps Script repair, based on current main.

## Issues corrected

| Issue | Effect | Change |
|---|---|---|
| Private reads and mutations used JSONP/GET | Cross-site executable responses and diary values in request URLs | Authenticated Apps Script HTML host plus native google.script.run; URL data routes removed |
| Sign-in merged every browser log and had no logout | Account switching could mix records; local data remained visible | Separate account cache; no automatic public-diary import; revocable six-hour-or-shorter Lab sessions and sign-out |
| Sync acknowledged the current entry rather than the sent snapshot | An edit during a save could be marked synced without being uploaded | Durable serialized queue, captured request snapshots and retryable updates |
| Deletes had no queue or revision checks | Failed deletions could return; older devices could overwrite changes | Persistent deletion requests, row revisions, idempotent retries and explicit conflict choices |
| Old time values became 1899 date strings | Inputs could show broken times after reload | Normalize legacy time values and save canonical time strings in payloads |
| Backend dropped awake minutes, strategy IDs and review boundaries | Another device could show different metrics or the wrong stage | Preserve full validated entry and cycle fields; calculate metrics on server |
| Tabs wrapped on desktop | Unnecessary vertical height | Six-column desktop navigation; three columns on small screens |
| Group thresholds used observation counts for some buckets | One person's repeated entries could populate a bar | Keep group reporting unavailable pending a proper aggregate privacy pass |

## Limits and follow-up

This PR is a candidate for live testing, not proof of a deployed secure service. Google Apps Script files must be manually updated and versioned, and a second school account must pass the access checks. The site has not been merged or deployed by this review.

New per-record JSON payloads and readable columns live in Records. Old email-bearing Nights/Cycles tabs remain for compatibility. Group analytics, class codes, automatic CSV import and resource applications are follow-up work.

The old Apps Script setup claims that JSONP is safe for private data and that a threshold is a complete anonymity guarantee were incorrect. The replacement guide supersedes them. Cloud Run billing and Vercel secrets are not required by this design.

See [the setup checklist](apps-script/SETUP.md) for the owner steps and test cases.

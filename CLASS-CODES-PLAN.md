# Teacher classes and comparisons

Approved plan. This draft implements the first release: server-verified teacher roles, class membership, join-code rotation/expiry, and reciprocal teacher comparison invitations. It builds on the mobile/account layout PR. Shared sleep summaries and contribution consent are not implemented or enabled. The current production Apps Script is unchanged until its owner deploys the two updated files.

## Student and teacher experience

Approved staff see a Teacher tab in the connected Lab. They can create a class with a display name and study period, generate a join code, copy it, close joining, rotate a code, and archive a class. Students use Group view to enter a code, confirm the class and teacher, and join. Personal logging never requires class membership.

A separate comparison invitation pairs two classes. The second class's teacher must accept before either class can see the other's eligible summaries. A join code is not a comparison invitation and does not reveal a class's results.

Group view shows a side-by-side summary for an agreed study period. Suggested first metrics are average estimated sleep and average morning energy. Calculate one mean per participating student first, then give each student equal weight in the class mean. Label sample coverage and separate baseline from trying changes. Differences are descriptive, not evidence that a class or teacher caused better sleep. Avoid ranking students or declaring a winning class.

## Access and storage

- The owner maintains approved school emails in a private Teachers tab. The server checks that list on every teacher action. A school email alone never grants a teacher role, and hiding a tab is not access control.
- New private Sheet tabs: Classes (owner, display name, study period, join state), Memberships (class/account IDs and dates), Comparisons (two class IDs, approval state and period), and PublishedSummaries (approved aggregate snapshots).
- Generate unpredictable join codes on the server, check uniqueness, store a keyed digest, expire them, and support rotation. Show the plaintext code when created; generate a replacement if lost. Rate-limit failed join attempts and return generic invalid/expired errors.
- Membership must be confirmed after previewing the intended class. Repeated joining is idempotent. Students can leave. For the pilot, allow one active class per study period to avoid overlapping comparison cohorts.
- Class membership never grants access to diary rows. Teacher class routes return membership administration and approved summaries only; no email-bearing legacy rows, individual nights, or per-student sleep metrics.
- Students explicitly choose to contribute to group summaries. Explain whether earlier entries in the chosen study period are included before confirmation. Declining does not block personal logging or the rest of the toolkit.

## Summary release rules

Start with a proposed floor of ten distinct contributing students per class and phase, each with at least five eligible morning-diary nights. This is a conservative product starting point, not a guarantee of anonymity. Confirm it against school class sizes and a privacy review before enabling reports. Recalled entries and incompatible legacy estimates should not enter the initial shared metrics.

Use fixed study periods and teacher-approved release snapshots, not live totals or arbitrary date filters. Show rounded averages and broad participant-count bands. Do not expose small subgroups, individual trajectories, exact membership-change effects, or downloadable raw data. Suppress both sides of a comparison if either cohort fails the release rules. Check overlap and complementary groups so subtraction cannot reveal a small set of students. Limit repeated releases over the same cohort; review changes before publishing another snapshot.

Leaving or deleting excludes the account from future summaries and removes the relevant active membership/contribution data. Published and copied aggregate snapshots cannot be reliably recalled; explain this before contribution. Define the school's retention period for classes, invitations, membership and snapshots before rollout.

## Build order and acceptance

1. Implement server-verified teacher roles, class create/archive, code generate/rotate and student join/leave, with no shared metrics yet.
2. Add explicit contribution choices and reciprocal teacher comparison invitations.
3. Implement fixed-period aggregates and suppression; test threshold edges, duplicates, unequal night counts, overlapping cohorts, code guessing, revoked staff, leaving and deletion.
4. Test with two approved teachers and two distinct classes using synthetic records, then approve the live release rules before collecting group data.

Owner input needed: the first approved teacher accounts, typical class sizes, intended study periods, and who approves comparison releases. Teacher emails belong in the private Sheet, not the public repository. No Vercel secrets or additional Cloud billing are required by this proposed Apps Script design. The backend update will require a new Apps Script version when implemented.

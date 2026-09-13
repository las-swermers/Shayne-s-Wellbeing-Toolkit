> Current connection: use [Apps Script setup](apps-script/SETUP.md) and [the connection review](CONNECTION-REVIEW.md). Private data now uses a Google-hosted Lab with native RPC, account-scoped caching and sign-out. No Cloud Run billing or Vercel secrets. Group reporting remains pending. Older transport/deployment instructions below are historical.

# After the design pass

## 1. Verify the refined experience

Review PR #9: toolkit-only hero, fog on scroll, sun/day toggle, cow entrance,
compact log and results, keyboard review steps, PDF preview and download.
Mobile and enlarged-text layouts should scroll naturally where needed; do not
shrink controls or hide content to force everything into one screen.

## 2. Complete the approved-account and data implementation

Follow GOOGLE-SETUP.md after confirming the authorized Cloud project owner and runtime
service account. Use one private Sheet and verified account ownership. The
current server remains a read-only connectivity foundation, not record sync.

Implement per-account storage and explicit import of device-only logs, durable
operation IDs, acknowledged deletion, serialized writes, and cross-device tests.
Carry the local rolling phase boundaries and versioned awake-minute calculations
in PROJECT-REVIEW.md into server validation before collecting records. Configure staff-created
class codes separately from authorization. Release aggregates only through the
protected server with distinct-student and complementary suppression controls.

## 3. Review sleep content with the school health team

This pass uses public CDC and NHLBI guidance and the abstract of the de Bruin
et al. 2015 adolescent CBT-I randomized trial. It distinguishes general sleep
habits from CBT-I principles, but does not establish efficacy for this two-week
experiment or for the ranking algorithm. A clinician with adolescent sleep
experience should review suggestions and escalation wording before the pilot.
No sleep-restriction schedule or medication recommendation is implemented.

Sources checked in this pass:
- https://doi.org/10.5665/sleep.5240 (abstract retrieved through Europe PMC)
- https://www.cdc.gov/sleep/about/index.html
- https://www.nhlbi.nih.gov/health/insomnia/treatment
- https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits

## 4. Expand one resource at a time

Follow RESOURCE-ROADMAP.md. Start with a feelings explorer or values card sort
that does not need personal cloud storage. Bring one existing resource and its
learning goal; review reuse permissions and remove real student answers first.
Set up Google identity and the private Sheet before any activity saves personal
responses, creates a class code, or shares a Roommate Agreement.

## 5. Roommate Agreement

Build only after shared accounts and room access are implemented. A staff-issued
room invitation should confirm house/room and participants. Each roommate fills
in their own preferences; the shared view compares agreement and discussion
points without exposing private drafts to others. Use prompts to support a
conversation, then let everyone approve a versioned shared agreement. Offer a
clean downloadable summary. Email delivery must be explicit and recipient
verified; do not automatically email private answers or infer roommates solely
from a room number entered by a student. Include room changes, leaving a room,
revoking access and deletion in the design. This remains a brief, not a launched
tool or a collected dataset.

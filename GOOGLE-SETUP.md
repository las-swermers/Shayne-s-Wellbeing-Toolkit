# Connect Google sign-in and the private Sheet

Shayne's Wellbeing Toolkit is an independent resource for Shayne's students,
not a school-sponsored product. The initial access policy still allows only
approved las.ch accounts. Branding and access policy are separate decisions.

## What is ready

| Component | Current status |
| --- | --- |
| Google identity verification and las.ch check | Implemented in google-server; not deployed |
| Stable opaque account IDs | Implemented; pseudonymous, not anonymous |
| Private Sheet connection | Read-only metadata probe; not configured |
| Student save, retrieve and cross-device sync | Not implemented |
| Staff class codes and protected group metrics | Not implemented |

This walkthrough deploys the identity/connectivity foundation only. It does
not turn on student record collection. Start with a test workbook, not real
student information.

## Architecture and a choice to understand

There are two connections: Google authenticates the person; the server's
service account accesses one private workbook. Students do not supply their
own Sheets, share the source workbook, or grant access to their Drive.

The current server hosts the whole website behind Cloud Run's Identity-Aware
Proxy (IAP). Google sign-in therefore happens BEFORE that protected site's
landing page. The separate Vercel design preview stays local-only. IAP does
not protect a separate public copy of the website.

If the desired production experience is a public landing page with sign-in
only when saving, retain that as the product goal: it needs a separate
authenticated-app entry or a reviewed in-page session architecture. Do not
assume the current whole-site IAP setup already implements that experience.

Keep the legacy ENDPOINT blank. It expects an old Apps Script deployment, not
a Sheet URL or this server. Apps Script is not needed for this architecture.

## 1. Confirm ownership and choose the project

Have the authorized Cloud project/billing owner select or create a project for
Shayne's Toolkit in Google Cloud Console. Record the project ID, numeric project
number, deployment region and technical owner.

Agree who may access the workbook, the student participation process, retention,
deletion and support before collecting data. Independent branding does not
remove those responsibilities.

Use a private test Sheet for the first connection. The workbook already supplied
in this conversation can be configured later by its authorized owner. Do not
publish it, make it link-accessible or share it with students. Hidden tabs are
not access boundaries. If Workspace blocks service-account sharing, ask the
administrator; do not weaken sharing policy to work around it.

## 2. Enable services and create a runtime identity

Enable Cloud Run, Cloud Build, Artifact Registry, Identity-Aware Proxy, Secret
Manager and Google Sheets APIs in the selected project.

In IAM & Admin > Service Accounts, create a dedicated runtime account such as
toolkit-runtime. The technical owner attaches it to the Cloud Run service.
Do not give it project Owner/Editor or download a JSON key. The app uses the
attached identity through Application Default Credentials. See Google's
[service identity guide](https://docs.cloud.google.com/run/docs/securing/service-identity).

Share only the test workbook with that exact service-account email as Viewer.
This phase reads metadata only. Do not grant Editor until record APIs have
been implemented and reviewed.

## 3. Create the account-ID secret

In Secret Manager, create toolkit-account-id-key with securely generated random
material of at least 32 characters. Do not paste it into this chat, GitHub or
HTML. Give the runtime identity Secret Accessor on this secret only, and expose
a pinned version to the container as ACCOUNT_ID_KEY. Follow Google's
[Cloud Run secret configuration](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

Keep this key stable and recoverable. It determines the opaque account IDs:
changing it without a migration would change every student's ID. Those IDs are
pseudonymous because records remain linked to an authenticated account.

## 4. Build and deploy the container

The technical owner builds this repository's Dockerfile, pushes the image to
Artifact Registry, then deploys a Cloud Run service such as shaynes-toolkit with
the runtime identity above. Use the repository container, not a static-site
deployment or an unconfigured Node image. See
[deploying container images](https://docs.cloud.google.com/run/docs/deploying).

Configure these container settings:

| Setting | Value |
| --- | --- |
| SPREADSHEET_ID | The test Sheet ID between /d/ and /edit in its URL |
| IAP_AUDIENCE | /projects/PROJECT_NUMBER/locations/REGION/services/shaynes-toolkit |
| ACCOUNT_ID_KEY | Secret Manager reference from step 3 |
| PORT | Provided by Cloud Run; server defaults to 8080 locally |

The audience uses the numeric project number and exact region/service name,
not the project ID, OAuth client ID or website URL. See Google's
[signed-header audience specification](https://docs.cloud.google.com/iap/docs/signed-headers-howto).
Missing configuration intentionally prevents startup.

## 5. Configure the Google login gate

In Cloud Run > service > Security, require authentication and enable IAP
directly. Confirm its service agent has Cloud Run Invoker. Do not also enable
IAP on a load balancer.

An organization-owned project can use the managed OAuth client for same-org
users. A personal/no-organization project, or users outside the project's
organization, needs the supported custom OAuth flow: Edit policy > Configure
in IAP, configure an accurate consent identity for Shayne's Toolkit and the
appropriate external audience, then generate the credentials. External audience
does not itself grant access.

Grant the approved pilot group or explicit test accounts IAP-secured Web App
User. The server additionally enforces las.ch after verifying the signed
assertion. Never put a client secret in HTML. Follow the current
[Cloud Run IAP instructions](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).
An administrator may also need to approve the app under Workspace policy.

## 6. Test without student records

| Check | Required result |
| --- | --- |
| Signed-out visit to protected URL | Google/IAP login |
| Approved las.ch test account | Site loads |
| Unapproved or outside-domain account | Rejected |
| /api/session | authenticated:true, accountId, toolkit name, recordSync:false |
| /api/connection | connected:true, recordSync:false; no workbook rows |
| Direct run.app URL | Still protected |
| Invalid, expired or incorrectly addressed assertion | Rejected |
| /google-server/.env and /apps-script/Code.gs | Not served |
| Runtime identity loses workbook access | Connection probe fails safely |

A successful connection is a metadata check, not proof of write access or
student sync. No tabs are created by the probe.

For connection errors check the Sheet ID, workbook sharing, attached service
account, API enablement and deployed revision. For login errors check IAP
policy, OAuth configuration and Workspace restrictions. Do not disable
authentication to make a failed check pass. Never post cookies, assertions,
secrets or student rows into issues or chat.

## 7. Implement records before a pilot

This remaining work is code, not a Console switch:

- Versioned Participants, Rounds, Entries, Cohorts and Operations schemas.
- Ownership from the verified session, never a browser-supplied account ID.
- Per-account browser storage, explicit local-log import and shared-device rules.
- Server validation and recomputed metrics matching the local awake-minutes-v1
  calculation and rolling-v1 boundaries described in PROJECT-REVIEW.md.
- Durable acknowledged operation IDs, serialized writes, conflict handling and
  deletion tombstones. One workbook does not provide transaction guarantees.
- Staff-created class codes, confirmed membership and privacy-protected group
  outputs based on distinct participants, including complementary suppression.
- Two-account/two-device tests covering reconnects, edits, deletion and export.

Only after review should the runtime receive workbook Editor access and the
required write scope. A live pilot requires the complete acceptance gates in
DELIVERY-PLAN.md, not just connected:true.

Build the next tools only after this foundation is accepted. Static activities
that never save responses can be prototyped now; personal results, class
membership, Roommate Agreement sharing and any saved quiz require verified
accounts, ownership rules and the reviewed record API first.

## Information needed next

The project ID and number, region, service name/URL, runtime service-account
email, workbook ownership confirmation and approved pilot group are useful
non-secret configuration facts. Keep passwords, private keys and student data
out of the conversation.

No Cloud configuration or workbook sharing has been changed by this PR.

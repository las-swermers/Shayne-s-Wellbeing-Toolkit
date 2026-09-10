# LAS Google setup — after design acceptance

## Current status

The design preview remains local-only. The optional google-server implementation
adds real IAP assertion verification and a read-only Sheet connectivity probe.
It has not been deployed or tested against LAS accounts or the supplied workbook.
Student record synchronization is not implemented in that server yet.

Use the existing school-owned workbook provided in this conversation. Its ID
belongs in the server SPREADSHEET_ID setting. Do not publish the workbook or
share it with students; hidden tabs are not separate access boundaries.

## Target architecture

For the initial org-only pilot, host the site and API together on Cloud Run,
behind Identity-Aware Proxy (IAP). Google handles the sign-in screen before
serving the site. A custom Google sign-in widget, student Drive permissions and
per-student Sheets are unnecessary for this deployment.

The Vercel design preview can remain available while it contains no school
records. If the entire toolkit must be private, disable its public production
copy when the protected school service is ready. IAP protects its own service;
it does not make a separate Vercel copy private.

## 1. School project and runtime identity

The LAS technical owner needs an organization-owned Google Cloud project,
billing, a selected region, and permission to deploy Cloud Run.

Enable Cloud Run, Cloud Build, Artifact Registry, IAP, Secret Manager and
Google Sheets APIs. Create a dedicated runtime service account. Use the
attached service identity / Application Default Credentials; do not download
a service-account JSON key.

Share only the pilot workbook with that service account as Viewer for this
connectivity phase. Editor access is needed only after the record API is
implemented and reviewed. Students receive no source-workbook sharing.

## 2. Container and server configuration

From the repository root, build the provided Dockerfile and push the image to
the school's Artifact Registry. It packages the static site and optional server,
not the legacy Apps Script, review documents or original PNG files.

The server refuses to start without these values:

| Setting | Value / source |
| --- | --- |
| IAP_AUDIENCE | Exact audience for the deployed service, obtained from IAP configuration |
| SPREADSHEET_ID | ID from the school-owned Sheet URL provided by the project owner |
| ACCOUNT_ID_KEY | At least 32 characters of cryptographically random secret material, injected from Secret Manager |
| PORT | Supplied by Cloud Run; 8080 locally |

Keep ACCOUNT_ID_KEY stable and backed up. Rotating it changes every account ID;
rotation requires a planned migration. Grant the runtime identity access only
to this secret. No values are inserted into index.html or sleep-lab.html.

For a local fail-closed smoke test:

    npm ci --prefix google-server
    npm test --prefix google-server
    node --env-file=google-server/.env google-server/server.mjs

Use a private local .env based on the example. A browser request without a valid
IAP assertion must be rejected locally; there is deliberately no development
authentication bypass.

## 3. Google Console sign-in configuration

In Cloud Run, select the service's Security settings, require authentication,
and enable IAP directly. Grant the approved LAS pilot group (or las.ch domain)
the IAP-secured Web App User role. Avoid public principals.

The Console grants invocation to the IAP service agent when enabling IAP.
Verify that the default run.app address also requires IAP, and do not separately
configure IAP on a load balancer. Google's current instructions are in
[Configure IAP for Cloud Run](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run).

IAP's signed JWT is validated with Google's public keys, configured audience and
issuer before its subject/email are used. The application then enforces the
exact las.ch domain. It does not trust unsigned email headers. See
[Signed IAP headers](https://docs.cloud.google.com/iap/docs/signed-headers-howto).

This uses IAP's Google login. A separate OAuth client ID/secret is not required
by this application code. If school policy requires a custom OAuth brand/client,
the LAS administrator should configure that through IAP's supported Console flow.

## 4. Verify identity and the workbook before any record writes

Use dedicated test accounts. Do not paste assertions, cookies, secrets or student
records into GitHub issues or this chat.

| Check | Required result |
| --- | --- |
| Signed-out visit to deployed site | Google/IAP sign-in |
| Approved LAS test account | Site loads |
| Personal Google or outside-domain account | Rejected |
| Valid identity but excluded pilot account | Rejected by IAP policy |
| /api/session | authenticated:true, opaque accountId, school:LAS, recordSync:false |
| /api/connection | connected:true, recordSync:false; no workbook contents returned |
| Invalid signature/audience/expired assertion | Rejected |
| Direct unsigned request to container API | Rejected |
| /google-server/.env or /apps-script/Code.gs | Not served |
| Runtime identity loses workbook access | /api/connection returns 503 |

The connectivity probe is read-only and checks spreadsheet metadata. It does
not confirm row schemas or write permissions and does not create tabs.

## 5. Implement records after design and access acceptance

Complete the data blockers in PROJECT-REVIEW.md and the model in
DELIVERY-PLAN.md. Required work:

- Versioned Participants, Rounds, Entries and Cohorts tabs.
- Authenticated same-origin APIs with ownership from the verified session.
- Validated dates, values and server-recomputed metrics.
- Serialized writes, acknowledged operation IDs, conflict detection and deletion
  tombstones that survive reconnects and retries.
- Per-account browser storage, explicit import ownership and shared-device policy.
- Staff-only cohort generation; code confirmation, revocation and round linkage.
- Suppressed group outputs based on distinct participants, never raw row access.
- Personal retrieval, CSV, print and full deletion tested across two devices.

Keep the existing ENDPOINT blank. Do not paste the Sheet URL into it: it expects
an old Apps Script deployment, not the new server. Apps Script can later support
staff maintenance; it is not needed for the IAP login or Sheets API access.

## Deployment information still needed

Project ID/number, approved region, service URL/audience, the runtime service
account, workbook ownership/access confirmation and approved pilot group.
These are configuration facts; passwords and private keys must remain in
school-managed systems.
